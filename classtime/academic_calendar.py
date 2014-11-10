
from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

from classtime.remote_db import RemoteDatabaseFactory
from classtime.local_db import LocalDatabaseFactory

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
        self._institution = institution
        self._datatype = 'terms'
        self._primary_key = 'term'
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

    def select_active_term(self, termid):
        """Set the calendar to a given term

        :param str termid: :ref:`4-digit term identifier
            <4-digit-term-identifier>`

        If the local db contains no terms, it will be
        filled with all terms from the remote db.

        If the local db contains no courses for this term,
        it will be filled with all courses for this term
        from the remote db.
        """
        self.use('terms')
        if not self._has_any():
            terms = self._fetch()
            self._save(terms)
        if not self._has_any(primary_key=termid):
            logging.warning('Invalid term {} selected'.format(termid))
            return
        self._term = termid

        self.use('courses')
        if not self._has_any():
            logging.info('Fetching courses for term {}'.format(self._term))
            courses = self._fetch(term=self._term)
            self._save(courses)

    def get_components(self, course):
        self.save_sections(course)

        course_data = self._local_db.courses().get(course).to_dict()
        section_query = self._local_db.sections() \
                                      .query() \
                                      .filter_by(course=course)
        for component in ['LEC', 'LAB', 'SEM']:
            section_models = section_query \
                .filter_by(component=component) \
                .order_by(self._local_db.Section.day.desc()) \
                .order_by(self._local_db.Section.startTime.desc()) \
                .order_by(self._local_db.Section.endTime.desc()) \
                .all()
            logging.debug('Found {} {}s for {}'.format(
                len(section_models), component, course))
            sections = list()
            for section_model in section_models:
                section = dict(course_data)
                section.update(section_model.to_dict())
                sections.append(section)
            component = _condense_similar_sections(sections)
            if len(component) > 0:
                yield component

    def save_sections(self, course):
        self.use('sections')
        if self._has_any(course=course):
            logging.debug('Not fetching <{}> course <{}> sections {}'.format(
                self._institution, course, '(already in local db)'))
            return
        sections = self._fetch(term=self._term,
                               course=course)

        self.use('classtimes')
        for section in sections:
            # class is a reserved keyword in python, so
            # instead class_ is used for the field in 
            # the Section sqlalchemy model
            section['class_'] = section.get('class')
            section.pop('class', None)

            classtimes = self._fetch(term=self._term,
                                     course=course,
                                     class_=section.get('class_'))
            _apply_classtimes(section, classtimes)

        self.use('sections')
        self._save(sections)

    def use(self, datatype):
        if 'term' in datatype:
            self._use_terms()
        elif 'course' in datatype:
            self._use_courses()
        elif 'section' in datatype:
            self._use_sections()
        elif 'classtime' in datatype:
            self._use_classtimes()
        else:
            logging.error('Cannot find datatype <{}>'.format(datatype))

    def _has_any(self, datatype=None, primary_key=None, **kwargs):
        if datatype is None:
            datatype = self._datatype
        return self._local_db.exists(datatype=datatype,
                                     primary_key=primary_key,
                                     **kwargs)

    def _fetch(self, datatype=None, **kwargs):
        if datatype is None:
            datatype = self._datatype
        if datatype not in self._remote_db.known_searches():
            logging.error('AcademicCalendar <{}> has no datatype <{}>'.format(
                self._institution, datatype))
            return False
        logging.debug("Fetching <{}> <{}> <{}> from remote db".format(
            self._institution, datatype, kwargs))
        return self._remote_db.search(datatype, **kwargs)

    def _save(self, objects, datatype=None, primary_key=None):
        if datatype is None:
            datatype = self._datatype
        if primary_key is None:
            primary_key = self._primary_key

        logging.debug("Saving some <{}> <{}> to local db".format(
            self._institution, datatype))
        self._local_db.use(datatype)
        for i, obj in enumerate(objects, start=1):
            if not self._has_any(datatype=datatype,
                                 primary_key=obj.get(primary_key)):
                if i % len(objects)/5 == 0 or i == len(objects):
                    logging.debug('...{}%\t({}/{})'.format(
                        i*100/len(objects), i, len(objects)))
                self._local_db.add(obj)
        try:
            self._local_db.commit()
        except:
            logging.error("Failed to add <{}> <{}> to local_db".format(
                self._institution, datatype))
        else:
            logging.info("Saved some <{}> <{}> to local_db".format(
                self._institution, datatype))

    def _use_terms(self):
        self._datatype = 'terms'
        self._primary_key = 'term'
        return self

    def _use_courses(self):
        self._datatype = 'courses'
        self._primary_key = 'course'
        return self

    def _use_sections(self):
        self._datatype = 'sections'
        self._primary_key = 'class_'
        return self

    def _use_classtimes(self):
        self._datatype = 'classtimes'
        self._primary_key = None
        return self

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
    length_pre = len(sections)
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
    if len(sections) < length_pre:
        logging.debug("Condensed course <{}:{}>'s sections: {}->{}".format(
            sections[0].get('course'),
            sections[0].get('component'),
            length_pre, len(sections)))
    return sections

def _apply_classtimes(section, classtimes):
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

    return section
