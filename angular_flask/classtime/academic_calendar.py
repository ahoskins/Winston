import sys
import re

from academic_databases.abstract_academicdb import AcademicDatabase

class AcademicCalendar(object):
    """
    Gives access to academic calendar data contained in
    an LDAP server
    """
    def __init__(self, institution_name):
        """
        Initialize the Calendar with a database connection
        to a specific institution, defined as a JSON config file
        """
        try:
            self._course_db = AcademicDatabase.build(institution_name)
            self._course_db.connect()
        except:
            raise

        self._all_terms = self._course_db.search('terms')
        self._terms_dict = {term.get('termTitle'): term.get('term')
                            for term in self._all_terms}
        self._term = None

        self._all_courses = None

    def select_current_term(self, termid):
        if termid not in self._terms_dict.values():
            raise Exception('Term #{} does not exist!'.format(termid))
        self._term = termid
        self._populate_courses_for_current_term()

    def get_term_list(self):
        return self._all_terms

    def get_courses_for_current_term(self):
        return self._all_courses

    def _populate_courses_for_current_term(self):
        """
        Prerequisite:
          Must have set the current term with select_current_term()

        Populates the courses dictionary with all courses available in
        the currently selected term
        """
        if self._term == None:
            raise Exception('Must select a term before looking for courses!')
        
        current_term = 'term={}'.format(self._term)
        self._all_courses = self._course_db.search('courses',
                                                   path=current_term)

    def _populate_sections_for_course(self, course):
        current_course = 'course={},term={}'.format(course['course'],
                                                    self._term)
        sections = self._course_db.search('sections',
                                          path=current_course)
        for section in sections:
            # class_ is a field in the Section sqlalchemy model
            # because class is a reserved keyword in python
            section['class_'] = section.get('class')
            section.pop('class', None)

            current_section = 'class={},{}'.format(section.get('class_'),
                                                   current_course)
            classtimes = self._course_db.search('classtimes',
                                                path=current_section)
            if len(classtimes) == 1:
                classtime = classtimes[0]
            else:
                classtime = dict()
            section['day'] = classtime.get('day')
            section['location'] = classtime.get('location')
            section['startTime'] = classtime.get('startTime')
            section['endTime'] = classtime.get('endTime')

        course['sections'] = sections
        return course
