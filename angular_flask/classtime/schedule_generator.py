
import heapq

from angular_flask.logging import logging
from angular_flask.classtime.schedule import Schedule

class ScheduleGenerator(object):
    """
    Class which builds optimal schedules out of
    course listings.
    """
    def __init__(self, cal, term, course_ids):
        """
        course_ids should be a list of integers representing the
        courses which should be in the schedule
        """
        logging.info('Creating ScheduleGenerator with course ids {}'.format(course_ids))
        self._course_ids = course_ids
        self._schedules = None

        self._cal = cal
        self._cal.select_current_term(term)

    def get_schedules(self):
        """Returns schedule objects generated from
        the courses passed upon initialization
        """
        self._generate_schedules()
        return self._schedules

    def _generate_schedules(self):
        """
        Generates good schedules based on the course list
        provided on initialization.

        The schedule generated returned will *not* be one
        of the schedules already in self.generated_schedules

        Backtracking - just do a depth-first search of the
        courses
        - maintain them in a priority queue with the sort
          order governed by their "score" regarding to
          whatever cost functions we define
        """
        logging.info('Generating schedules for course ids {}'.format(self._course_ids))
        components = self._cal.get_components_for_course_ids(self._course_ids)
        logging.debug('Components to schedule: {}'.format(len(components)))

        HEAP_SIZE = 50

        components = sorted(components, key=lambda component: len(component))
        candidates = [Schedule()]
        for i, component in zip(range(len(components)), components):
            logging.debug('Scheduling Course {}:{} ({}/{})'.format(
                          component[0].get('course'), component[0].get('component'),
                          i+1, len(components)))
            for sched in candidates[:]:
                for section in component:
                    if sched.conflicts(section):
                        continue
                    new_candidate = sched.add_section_and_deepcopy(section)
                    if len(candidates) > HEAP_SIZE:
                        heapq.heapreplace(candidates, new_candidate)
                    else:
                        heapq.heappush(candidates, new_candidate)
            logging.debug('# Candidates: {}'.format(len(candidates)))

        if len(candidates) > 0:
            self._schedules = [heapq.heappop(candidates) for _ in range(5)]
        else:
            self._schedules = None
