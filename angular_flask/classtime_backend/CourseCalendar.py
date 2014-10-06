import sys
import re

import ldap
from ldap.controls import SimplePagedResultsControl

class CourseCalendar(object):
    """
    Gives access to course calendar data contained in
    an LDAP server
    """
    def __init__(self, server='directory.srv.ualberta.ca', basedn='ou=calendar,dc=ualberta,dc=ca'):
        """
        Initialize the LDAP connection to the server, as well
        as the base distinguished name to search from (the root
        of the tree you want to access).
        """
        self.client = ldap.initialize('ldap://{}'.format(server))
        self.server = server
        self.basedn = basedn

        self.all_terms = []
        self.terms_dict = None
        self.term = None

        self.all_courses = None
        self.my_courses = []

        try:
            self.client.start_tls_s()
            self.client.simple_bind_s()
        except ldap.LDAPError, e:
            if type(e.message) == dict and e.message.has_key('desc'):
                print e.message['desc']
            else:
                print e
            sys.exit()

    def pickTerm(self, term):
        """
        Set the term that this course should be used for

        term -- semantic term name of the form:
            '[Continuing Ed ]<Season> Term <Year>'
            eg 'Winter Term 2014', 'Continuing Ed Summer Term 2011'
        """
        if self.terms_dict == None:
            self._populateTerms()
        term_m = re.compile('(Continuing Ed )?((Winter)|(Spring)|(Summer)|(Fall)) Term \d{4}')
        if not term_m.match(term):
            print 'Invalid term "' + term + '" supplied'
            print 'Must be of form "[Continuing Ed ]<Season> Term <Year>"'
            print 'Where <Season> is (Winter|Spring|Summer|Fall), case sensitive'
            return False
        self.term = self.terms_dict[term]
        self._populateCourses()
        return True
    
    def findCoursesBySubject(self, subject):
        """
        Prerequisite:
          Must have picked a term, ie self.term not None

        Finds all courses matching or partially matching subject
          ie subject='ECE' matches ECE courses
             subject='ENG' matches ENGL and ENG M courses (and maybe others)
        """
        m = re.compile(subject.replace(' ', '') + '.*', re.IGNORECASE)
        return [course for course in self.all_courses \
                if m.match(course['asString'].replace(' ', ''))]

    def findCoursesByDesc(self, desc):
        pass

    def addCourse(self, query):
        """
        Prerequisite:
          Must have selected a term ie self.pickTerm(term)

        Adds course to the 'shopping cart' ie self.my_courses

        Returns None, errormsg if query is not specific enough (ie it returns more than one possible
            course)
        Returns True, successmsg on success
        """
        courses = self.findCoursesBySubject(query)
        if len(courses) > 1:
            retmsg = 'Not specific enough, no course added.\n'
            retmsg += 'Did you mean:\n'
            for c in courses:
                retmsg += c['asString'] + '\n'
            return None, retmsg
        course = self._populateSectionsForCourse(courses[0])
        self.my_courses.append(course)
        return True, str(course['asString'] + ' successfully added')

    def _search(self, search_flt, attrs, scope=ldap.SCOPE_ONELEVEL, limit=None, basedn=None):
        """
        Query the course calendar for records matching the search filter.
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
            basedn = self.basedn

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
                msgid = self.client.search_ext(basedn, scope,
                                               search_flt, attrlist=attrs,
                                               serverctrls=[page_control])
            except:
                print 'ERROR: \n{}'.format(str(sys.exc_info()[0]))
                sys.exit(1)
            pages_retrieved += 1
            result_type, data, msgid, serverctrls = self.client.result3(msgid)
            page_control.cookie = serverctrls[0].cookie
            # LDAP returns a list of 2-element lists. The 1st element
            # is the dn, 2nd element is the attribute dict
            dictlist = [i[1] for i in data]
            # Each key's value is a single-element list.
            # This pulls the value out of the list.
            results += [{k:v[0] for k,v in d.items()} for d in dictlist]
        return results

    def _populateTerms(self):
        """
        Populates self.terms_dict with a dict mapping semantic term names to
        LDAP term number

        Also, populates self.all_terms with a list of all terms
        """
        self.terms_dict = dict()

        terms_flt = '(&(term=*)(!(course=*)))'
        attrs = ['term',
                 'termTitle',
                 'startDate',
                 'endDate']
        self.all_terms = self._search(terms_flt, attrs);
        for term in self.all_terms:
            self.terms_dict[term['termTitle']] = term['term']

    def _populateCourses(self):
        """
        Prerequisite:
          Must have set the current term with pickTerm()

        Populates the courses dictionary with all courses available in
        the currently selected term
        """
        if self.term == None:
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
        termdn = 'term={},{}'.format(self.term, self.basedn)
        self.all_courses = self._search(courses_flt, attrs,
                                    basedn=termdn)

    def _populateSectionsForCourse(self, course):
        class_flt = '(class=*)'
        coursedn = 'course={},term={},{}'.format(course['course'],
                                                 self.term,
                                                 self.basedn)
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

    def _populateSections(self):
        for course in self.my_courses:
            course = self._populateSectionsForCourse(course)
