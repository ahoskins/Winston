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
        self.my_courses.append(courses[0])
        return True, str(courses[0]['asString'] + ' successfully added')

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
        """
        self.terms_dict = dict()

        terms_flt = '(&(term=*)(!(course=*)))'
        attrs = ['term', 'termTitle']
        terms = self._search(terms_flt, attrs);
        for term in terms:
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
        attrs = ['course', 'subject', 'subjectTitle', 'catalog', \
                 'courseTitle', 'courseDescription', 'asString']
        termdn = 'term={},{}'.format(self.term, self.basedn)
        self.all_courses = self._search(courses_flt, attrs,
                                    basedn=termdn)

    def _populateSections(self):
        """

        """
        for course in self.my_courses:
            class_flt = '(class=*)'
            coursedn = 'course={},term={},{}'.format(course['course'],
                                                     self.term,
                                                     self.basedn)
            attrs = ['term', 'course', 'class',
                     'section', 'component', 'enrollStatus',
                     'asString']
            sections = self._search(class_flt, attrs,
                                  basedn=coursedn)
            for section in sections:
                section_flt = '(classtime=*)'
                sectiondn = 'class={},{}'.format(section['class'],
                                                  coursedn)
                attrs = ['term', 'course', 'class', 'classtime',
                         'day', 'startTime', 'endTime', 'location']
                classtimes = self._search(section_flt, attrs,
                                         basedn=sectiondn)
                if len(classtimes) > 1:
                    print 'Shit, didn\'t handle this case.'
                    print 'Multiple classtime objects for section'
                    print section['asString']
                    # sys.microwaveKernel()
                    sys.exit()
                classtime = classtimes[0]
                section['day'] = classtime['day']
                section['startTime'] = classtime['startTime']
                section['endTime'] = classtime['endTime']

            course['sections'] = sections
