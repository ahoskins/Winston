
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
        self._course_ids = course_ids
        self._schedules_heapq = None

        self._cal = cal
        self._cal.select_current_term(term)

    def get_schedules(self, num_schedules):
        """Returns schedule objects generated from
        the courses passed upon initialization
        """
        self._schedules_heapq = self._generate_schedules(num_schedules)
        return [heapq.heappop(self._schedules_heapq)
                for _ in range(len(self._schedules_heapq))]

    def _generate_schedules(self, num_schedules):
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
        logging.debug('There are {} components to schedule'.format(len(components)))

        CANDIDATE_POOL_SIZE = 50

        components = sorted(components, key=lambda component: len(component))
        candidates = [Schedule()]
        components_considered = 0
        for component in components:
            logging.debug('Scheduling {}:{}\t({}/{})'.format(
                          component[0].get('asString'), component[0].get('component'),
                          components_considered+1, len(components)))
            for sched in candidates[:]:
                if len(sched.sections) != components_considered:
                    continue
                for section in component:
                    if sched.conflicts(section):
                        continue
                    new_candidate = sched.add_section_and_deepcopy(section)
                    if len(candidates) >= CANDIDATE_POOL_SIZE:
                        heapq.heapreplace(candidates, new_candidate)
                    else:
                        heapq.heappush(candidates, new_candidate)
            components_considered += 1
            logging.debug('{} Candidates'.format(len(candidates)))

        winners = list()
        while candidates and len(winners) < num_schedules:
            smallest = heapq.heappop(candidates)
            if len(smallest.sections) == len(components):
                heapq.heappush(winners, smallest)
        return winners
