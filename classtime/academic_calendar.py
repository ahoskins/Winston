
from classtime.remote_db import RemoteDatabaseFactory
from classtime.local_db import LocalDatabaseFactory
from angular_flask.logging import logging
logging = logging.getLogger(__name__)

class AcademicCalendar(object):
    """Manages academic calendar data for a particular institution
    """

    def __init__(self, institution):
        """Create a calendar for a specific institution

        :param str institution: name of JSON configuration
            file which describes how to deal with this particular
            institution. See :py:class:`RemoteDatabaseFactory` for
            the exact file location.

        See 'classtime/institutions/ualberta.json' for an example.
        """
        try:
            self._remote_db = RemoteDatabaseFactory.build(institution)
            self._remote_db.connect()
        except:
            raise

        try:
            self._local_db = LocalDatabaseFactory.build(institution)
            self._local_db.create()
        except:
            raise

        self._term = None

    def select_current_term(self, termid):
        """Set the calendar to a given term

        :param str termid: :ref:`4-digit term identifier
            <4-digit-term-identifier>`

        If the local db contains no terms, it will be
        filled with all terms from the remote db.

        If the local db contains no courses for this term,
        it will be filled with all courses for this term
        from the remote db.
        """
        if not self._local_db.terms().exists():
            self._populate_terms()

        if not self._local_db.terms().exists(termid):
            logging.warning('Invalid term {} selected'.format(termid))
            return
        self._term = termid
        self._populate_courses_for_cur_term()

    def get_components_for_course_ids(self, course_ids):
        """Get components of all given courses

        :param course_ids: list of :ref:`6-digit course identifiers
            <6-digit-course-identifier>`
        :type course_ids: list of strings

        :returns: list of components, where each element
            is a list of all sections available for that
            particular component. A component is a LEC,
            LAB, SEM, etc. of a given course. The list is
            ordered ascending by the number of sections in
            each component. 
        :rtype: list
        """
        components = []
        for course_id in course_ids:
            self._populate_sections_for_course(course_id)
            base_section = self._local_db.courses().get(course_id).to_dict()
            all_sections = self._local_db.sections() \
                                         .query() \
                                         .filter_by(course=course_id)
            for component in ['LEC', 'LAB', 'SEM']:
                section_models = all_sections \
                    .filter_by(component=component) \
                    .order_by(self._local_db.Section.day.desc()) \
                    .order_by(self._local_db.Section.startTime.desc()) \
                    .order_by(self._local_db.Section.endTime.desc()) \
                    .all()
                sections = []
                for section_model in section_models:
                    section = dict(base_section)
                    section.update(section_model.to_dict())
                    sections.append(section)
                sections = _condense_similar_sections(sections)

                if len(sections) > 0:
                    components.append(sections)
        return sorted(components, key=len)

    def _populate_terms(self):
        """Fill the local db with terms
        """
        if self._local_db.terms().exists():
            return

        all_terms = self._remote_db.search('terms')
        for term in all_terms:
            if not self._local_db.terms().exists(term.get('term')):
                self._local_db.terms().add(term)
        try:
            self._local_db.commit()
        except:
            logging.error('Terms failed to add to local_db')
        else:
            logging.info('Terms successfully populated')

    def _populate_courses_for_cur_term(self):
        """Fill the local db with courses in the current term

        Prerequisite:
          Must have set the current term with select_current_term()
        """
        if self._term is None:
            raise Exception('Must select a term before looking for courses!')
        
        if self._local_db.courses().exists():
            return

        logging.info('Populating courses for term {}'.format(self._term))
        logging.debug('Fetching courses from remote server...')
        all_courses = self._remote_db.search('courses',
                                             term=self._term)
        logging.debug('...fetched')
        logging.debug('Adding courses to local database...')
        for i, course in enumerate(all_courses, start=1):
            if not self._local_db.courses().get(course.get('course')):
                if i % 500 == 0 or i == len(all_courses):
                    logging.debug('{}%\t({}/{})'.format(
                        i*100/len(all_courses), i, len(all_courses)))
                self._local_db.courses().add(course)
        try:
            self._local_db.commit()
        except:
            logging.error('Failed to add courses to database for'\
                +'term={}'.format(self._term))

    def _populate_sections_for_course(self, course):
        """Fill the local db with sections in the given course
        """
        if self._local_db.sections().query().filter_by(course=course).first():
            return

        logging.info('Populating sections for course {}'.format(course))

        sections = self._remote_db.search('sections',
                                          term=self._term,
                                          course=course)
        for section in sections:
            # class is a reserved keyword in python, so
            # instead class_ is used for the field in 
            # the Section sqlalchemy model
            section['class_'] = section.get('class')
            section.pop('class', None)

            classtimes = self._remote_db.search('classtimes',
                                                term=self._term,
                                                course=course,
                                                class_=section.get('class_'))
            if len(classtimes) == 0:
                logging.warning('{} has zero timetable objects'\
                    .format(section.get('asString')))
                classtime = dict()
            elif len(classtimes) == 1:
                classtime = classtimes[0]
            else:
                logging.warning('{} has multiple timetable objects'\
                    .format(section.get('asString')))
                classtime = classtimes[0]
            section['day'] = classtime.get('day')
            section['location'] = classtime.get('location')
            section['startTime'] = classtime.get('startTime')
            section['endTime'] = classtime.get('endTime')

            self._local_db.sections().add(section)
        try:
            self._local_db.commit()
        except:
            logging.error('Failed to add sections to database for course {}'\
                .format(course))


def _condense_similar_sections(sections):
    """Fold similar sections into each other and return the result
    
    :param list sections: a list of section dicts. **Must be sorted
        by day, startTime, and endTime**.
    :returns: a list of section dicts where each element has the
    'similarSections' field.

    similarSections is a list of other sections which are:
    1. The same component (ie CHEM 103 LAB)
    2. On the same day
    2. At the same time (same startTime and endTime)
    """
    if len(sections) <= 1:
        return sections
    logging.debug('Condensing Course {}:{}'.format(
        sections[0].get('course'),
        sections[0].get('component')))
    lag, lead = 0, 1
    while lead < len(sections):
        section, lead_section = sections[lag], sections[:][lead]
        if  section.get('day') == lead_section.get('day') \
        and section.get('startTime') == lead_section.get('startTime') \
        and section.get('endTime') == lead_section.get('endTime'):
            if 'similarSections' not in section:
                section['similarSections'] = []
            section['similarSections'].append(lead_section)
            sections.remove(lead_section)
        else:
            lag = lead
            lead += 1
    return sections
