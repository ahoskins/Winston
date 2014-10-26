
from angular_flask.classtime.remote_db.remotedb_factory import RemoteDatabaseFactory
from angular_flask.classtime.local_db.localdb_factory import LocalDatabaseFactory
from angular_flask.classtime.local_db import Term, Course, Section
from angular_flask.logging import logging

class AcademicCalendar(object):
    """
    Manages academic calendar information, including
    terms, courses and sections.

    Connects to an institution's course database using any
    implementation of the AcademicDatabase abstract base class.
    """
    def __init__(self, institution_name):
        """
        Initialize the Calendar with a database connection
        to a specific institution whose configuration is defined
        by a JSON file in academic_databases/institutions.

        See 'institutions/ualberta.json' for an example.
        """
        try:
            self._remote_db = RemoteDatabaseFactory.build(institution_name)
            self._remote_db.connect()
        except:
            raise

        try:
            self._local_db = LocalDatabaseFactory.build(institution_name)
            self._local_db.create_all()
        except:
            raise

        self._term = None

    def select_current_term(self, termid):
        """
        Sets the current term to the given term.

        If terms have not been populated, populates terms.

        If courses for this term have not been populated,
        populates courses for this term.
        """
        if Term.query.first() is None:
            self._populate_terms()

        if Term.query.get(termid) is None:
            logging.warning('Invalid termid {} selected'.format(termid))
            return
        self._term = termid
        self._populate_courses_for_current_term()

    def get_components_for_course_ids(self, course_ids):
        """
        Returns a list of components

        A component is a list of sections which could fill
        a particular schedule slot (ie CHEM LAB, PHYS LEC)

        A section is a dictionary of attributes defined
        in the Section model.
        """
        components = []
        for course_id in course_ids:
            self._populate_sections_for_course_id(course_id)
            base_section_info = Course.query.get(course_id).to_dict()
            course_query = Section.query.filter_by(course=course_id)
            for component in ['LEC', 'LAB', 'SEM']:
                section_models = course_query \
                                 .filter_by(component=component) \
                                 .order_by(Section.day.desc()) \
                                 .order_by(Section.startTime.desc()) \
                                 .order_by(Section.endTime.desc()) \
                                 .all()
                sections = []
                for section_model in section_models:
                    section = dict(base_section_info)
                    section.update(section_model.to_dict())
                    sections.append(section)
                sections = self._condense_similar_sections(sections)

                if len(sections) > 0:
                    components.append(sections)
        return components

    def _populate_terms(self):
        if Term.query.first() is not None:
            return

        all_terms = self._remote_db.search('terms')
        for term in all_terms:
            if not Term.query.get(term.get('term')):
                self._local_db.session.add(Term(term))
        try:
            self._local_db.session.commit()
        except:
            logging.warning('Terms failed to add to local_db')
        else:
            logging.info('All terms successfully added')

    def _populate_courses_for_current_term(self):
        """
        Prerequisite:
          Must have set the current term with select_current_term()

        Populates the courses dictionary with all courses available in
        the currently selected term
        """
        if self._term == None:
            raise Exception('Must select a term before looking for courses!')
        
        if Course.query.first() is not None:
            # If the course database is filled already, don't bother
            return

        logging.info('Populating courses for term {}'.format(self._term))
        logging.debug('Fetching from remote server...')
        current_term = 'term={}'.format(self._term)
        all_courses = self._remote_db.search('courses',
                                             path=current_term)
        logging.debug('...fetched')
        num_courses = len(all_courses)
        for i, course in zip(range(1, num_courses+1), all_courses):
            if not Course.query.get(course.get('course')):
                if i % 500 == 0 or i == num_courses:
                    logging.debug('{}%\t({}/{})'.format(i*100/num_courses, i, num_courses))
                self._local_db.session.add(Course(course))
        try:
            self._local_db.session.commit()
        except:
            logging.warning('Courses failed to add to database')
        else:
            logging.info('Courses successfully added to database')

    def _populate_sections_for_course_id(self, courseid):
        if Section.query.filter_by(course=courseid).first():
            return

        logging.info('Populating sections for course {}'.format(courseid))

        current_course = 'course={},term={}'.format(courseid,
                                                    self._term)
        sections = self._remote_db.search('sections',
                                          path=current_course)
        for section in sections:
            # class_ is a field in the Section sqlalchemy model
            # because class is a reserved keyword in python
            section['class_'] = section.get('class')
            section.pop('class', None)

            current_section = 'class={},{}'.format(section.get('class_'),
                                                   current_course)
            classtimes = self._remote_db.search('classtimes',
                                                path=current_section)
            if len(classtimes) == 1:
                classtime = classtimes[0]
            else:
                classtime = dict()
            section['day'] = classtime.get('day')
            section['location'] = classtime.get('location')
            section['startTime'] = classtime.get('startTime')
            section['endTime'] = classtime.get('endTime')

            self._local_db.session.add(Section(section))
        try:
            self._local_db.session.commit()
        except:
            logging.warning('Failure')
        else:
            logging.info('Success')

    def _condense_similar_sections(self, sections):
        """
        Returns a list of sections where each element has the
        'similarSections' field.

        similarSections is a list of other sections which are:
        1. The same component (ie CHEM 103 LAB)
        2. On the same day
        2. At the same time (same startTime and endTime)

        PRECONDITIONS: sections **MUST** be sorted by:
        1. day
        2. startTime
        3. endTime
        """
        if len(sections) <= 1:
            return sections
        logging.debug('Condensing Course {}:{}'.format(sections[0].get('course'), sections[0].get('component')))
        lag, lead, num_sections = 0, 1, len(sections)
        while lead < num_sections:
            section, lead_section = sections[lag], sections[lead]
            if  section.get('day') == lead_section.get('day') \
            and section.get('startTime') == lead_section.get('startTime') \
            and section.get('endTime') == lead_section.get('endTime'):
                if 'similarSections' not in section:
                    section['similarSections'] = []
                section['similarSections'].append(lead_section)
                lead += 1
            else:
                lag = lead
                lead += 1
        condensed = [section for section in sections if 'similarSections' in section]
        if len(condensed) > 0:
            return condensed
        else:
            return sections
