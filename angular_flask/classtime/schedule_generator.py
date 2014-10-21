
import heapq

from angular_flask.logging import logging
from angular_flask.models import Section
from schedule import Schedule

class ScheduleGenerator(object):
    """
    Helper class which builds optimal schedules out of
    class listings.

    Use static methods only - do not create instances of
    the class.
    """
    def __init__(self, course_list):
        """
        course_list should be a list of course dictionaries,
        each containing a list 'sections' of sections.

        Like so:
        [
            {
                'course_name' : 'course_asString',
                'course_attr_a' : 'someattr',
                ...
                'sections' : [
                                {
                                    'section_asString' : 'LEC A1',
                                    'component' : '<component>',
                                    'day' : '<daystring>',
                                    'startTime' : '<time>',
                                    'endTime' : '<time>'
                                },
                                ...
                                {
                                    ...
                                }
                            ]
            },
            ...
            { 
                ...
            }
        ]
        Where:

        <component> is one of LEC, LAB or SEM

        <daystring> is a string containing the days the
          class is scheduled on:
          - UMTWRFS is Sunday...Saturday
          - eg 'MWF' or 'TR'

        <time> is a time of format 'HH:MM XM'
          - eg '08:00 AM'
        """
        course_ids = [int(course.get('course')) for course in course_list]
        logging.info('Creating ScheduleGenerator with course ids "{}"'.format(course_ids))
        for course_id, course in zip(course_ids, course_list):
            sections = []
            for section in Section.query.filter_by(course=course_id).all():
                sections.append(section.to_dict())
            
            course['sections'] = sections

            msg_num_sections = 'found {} sections for course "{}"' \
                               .format(len(sections), course_id)
            if len(sections) < 1:
                logging.warning(msg_num_sections)
            else:
                logging.debug(msg_num_sections)
        self.course_list = sorted(course_list,
                                  key=lambda course: len(course.get('sections')))
        self._group_sections()
        self.generated_schedules = []

    def get_schedules(self):
        """Returns schedule objects generated from
        the course_list passed upon initialization
        """
        self._generate_schedule()
        return self.generated_schedules

    def _group_sections(self):
        for course in self.course_list:
            for component in ['LEC', 'LAB', 'SEM']:
                course[component] = []
            sections = course.get('sections')
            for section in sections:
                component = section.get('component')
                if component is not None:
                    course[component].append(section)

    def _generate_schedule(self):
        """
        Generates one good schedule based on the course list
        provided on initialization.

        The schedule generated returned will *not* be one
        of the schedules already in self.generated_schedules

        Backtracking - just do a depth-first search of the
        courses
        - maintain them in a priority queue with the sort
          order governed by their "score" regarding to
          whatever cost functions we define
        """
        heap = [Schedule()]
        logging.info('Generating schedule')
        component_types = ['LEC', 'LAB', 'SEM']
        for course in self.course_list:
            logging.debug('Scheduling course "{}"'.format(course['course']))
            for component in [course[c_type] for c_type in component_types]:
                if len(component):
                    logging.debug('Scheduling component "{}"'.format(component[0]['component']))
                    half_done_schedules = [heapq.heappop(heap) for _ in range(len(heap))]
                    for section, i in zip(component, range(len(component))):
                        logging.debug('\t{}/{}'.format(i, len(component)))
                        for sched in half_done_schedules:
                            if not sched.conflicts(section):
                                heapq.heappush(heap, sched.add_section_and_deepcopy(section))

        logging.info('Candidates')
        candidates = [heapq.heappop(heap) for _ in range(len(heap))]
        for candidate in candidates:
            logging.info(candidate)

        for candidate in candidates[:5]:
            self.generated_schedules.append(candidate.sections)       
