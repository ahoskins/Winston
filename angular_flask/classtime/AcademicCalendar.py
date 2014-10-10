import sys
import re

import ldap
from ldap.controls import SimplePagedResultsControl

class AcademicCalendar(object):
    """
    Gives access to academic calendar data contained in
    an LDAP server
    """
    def __init__(self, server='directory.srv.ualberta.ca', basedn='ou=calendar,dc=ualberta,dc=ca'):
        """
        Initialize the LDAP connection to the server, as well
        as the base distinguished name to search from (the root
        of the tree you want to access).
        """
        self._client = ldap.initialize('ldap://{}'.format(server))
        self._basedn = basedn

        self._all_terms = []
        self._terms_dict = None
        self._term = None

        self._all_courses = None
        self._my_courses = []

        try:
            self._client.start_tls_s()
            self._client.simple_bind_s()
        except ldap.LDAPError, e:
            if type(e.message) == dict and e.message.has_key('desc'):
                print e.message['desc']
            else:
                print e
            sys.exit()

        self._populate_term_list()

    def select_current_term_by_id(self, termid):
        if termid not in self._terms_dict.values():
            raise Exception('Term #{} does not exist!'.format(termid))
        self._term = termid
        self._populate_courses_for_current_term()

    def select_current_term_by_query(self, term):
        """
        Set the term that this course should be used for

        term -- semantic term name of the form:
            '[Continuing Ed ]<Season> Term <Year>'
            eg 'Winter Term 2014', 'Continuing Ed Summer Term 2011'
        """
        if self._terms_dict == None:
            self._populate_term_list()
        term_m = re.compile('(Continuing Ed )?((Winter)|(Spring)|(Summer)|(Fall)) Term \d{4}')
        if not term_m.match(term):
            raise Exception('Invalid term "' + term + '" supplied')
        self._term = self._terms_dict[term]
        self._populate_courses_for_current_term()

    def get_term_list(self):
        return self._all_terms

    def get_courses_for_current_term(self):
        return self._all_courses

    def add_course_by_query(self, query):
        """
        Prerequisite:
          Must have selected a term ie self.select_current_term_by_query(term)

        Adds course to the 'shopping cart' ie self._my_courses

        Returns None, errormsg if query is not specific enough (ie it returns more than one possible
            course)
        Returns True, successmsg on success
        """
        courses = self.find_courses_by_subject(query)
        if len(courses) > 1:
            retmsg = 'Not specific enough, no course added.\n'
            retmsg += 'Did you mean:\n'
            for c in courses:
                retmsg += c['asString'] + '\n'
            return None, retmsg
        course = self._populate_sections_for_course(courses[0])
        self._my_courses.append(course)
        return True, str(course['asString'] + ' successfully added')

    def _search(self, search_flt, attrs, scope=ldap.SCOPE_ONELEVEL, limit=None, basedn=None):
        """
        Query the academic calendar for records matching the search filter.
        Only looks one level deep in the tree by default to improve
          performance, so be sure to pass the basedn above where you want
          to search.
        Returns a list of matches. Each match is an attribute dictionary.

        search_flt -- LDAP-style search filter
        attrs -- attributes to be returned from records
        scope -- how far down in the tree to look (ldap.SCOPE_*)
        limit -- upper limit of records to return
        """
        if limit == None:
            limit = float('inf')
        if basedn == None:
            basedn = self._basedn

        PAGE_SIZE = 300
        page_control = SimplePagedResultsControl(
            criticality=True, size=PAGE_SIZE, cookie=''
        )

        results = []
        pages_retrieved = 0
        first_pass = True
        while pages_retrieved*PAGE_SIZE < limit and page_control.cookie \
              or first_pass:
            first_pass = False
            try:
                msgid = self._client.search_ext(basedn, scope,
                                               search_flt, attrlist=attrs,
                                               serverctrls=[page_control])
            except:
                print 'ERROR: \n{}'.format(str(sys.exc_info()[0]))
                sys.exit(1)
            pages_retrieved += 1
            result_type, data, msgid, serverctrls = self._client.result3(msgid)
            page_control.cookie = serverctrls[0].cookie
            # LDAP returns a list of 2-element lists. The 1st element
            # is the dn, 2nd element is the attribute dict
            dictlist = [i[1] for i in data]
            # Each key's value is a single-element list.
            # This pulls the value out of the list.
            results += [{k:v[0].decode('utf-8') for k,v in d.items()} for d in dictlist]
        return results

    def _populate_term_list(self):
        """
        Populates self._all_terms with a list of all terms

        Also populates self._terms_dict with a dict mapping semantic term names to
        LDAP term number
        """
        self._terms_dict = dict()

        terms_flt = '(&(term=*)(!(course=*)))'
        attrs = ['term',
                 'termTitle',
                 'startDate',
                 'endDate']
        self._all_terms = self._search(terms_flt, attrs);
        for term in self._all_terms:
            self._terms_dict[term['termTitle']] = term['term']

    def _populate_courses_for_current_term(self):
        """
        Prerequisite:
          Must have set the current term with select_current_term_by_**()

        Populates the courses dictionary with all courses available in
        the currently selected term
        """
        if self._term == None:
            raise Exception('Must select a term before looking for courses!')
        courses_flt = '(course=*)'
        attrs = ['term',
                 'course',
                 'subject',
                 'subjectTitle',
                 'catalog',
                 'courseTitle',
                 'courseDescription',
                 'facultyCode',
                 'faculty',
                 'departmentCode',
                 'department',
                 'career',
                 'units',
                 'asString']
        termdn = 'term={},{}'.format(self._term, self._basedn)
        self._all_courses = self._search(courses_flt, attrs,
                                    basedn=termdn)

    def _populate_sections_for_course(self, course):
        class_flt = '(class=*)'
        coursedn = 'course={},term={},{}'.format(course['course'],
                                                 self._term,
                                                 self._basedn)
        attrs = ['term',
                 'course',
                 'class',
                 'section',
                 'component',
                 'classType',
                 'classStatus',
                 'enrollStatus',
                 'capacity',
                 'session',
                 'campus',
                 'classNotes',
                 'instructorUid'
                 'asString']
        sections = self._search(class_flt, attrs,
                              basedn=coursedn)
        for section in sections:
            # class is reserved keyword in python
            section['class_'] = section.get('class')
            section.pop('class', None)

            section_flt = '(classtime=*)'
            sectiondn = 'class={},{}'.format(section.get('class_'),
                                              coursedn)
            attrs = ['day', 'startTime', 'endTime', 'location']
            classtimes = self._search(section_flt, attrs,
                                     basedn=sectiondn)
            if len(classtimes) != 1:
                print 'Shit, didn\'t handle this case.'
                print '{} classtime objects for section'.format(len(classtimes))
                classtime = dict()
                # print section['asString']
                # sys.microwaveKernel()
                # sys.exit()
            else:
                classtime = classtimes[0]
            section['day'] = classtime.get('day')
            section['location'] = classtime.get('location')
            section['startTime'] = classtime.get('startTime')
            section['endTime'] = classtime.get('endTime')

        course['sections'] = sections
        return course
