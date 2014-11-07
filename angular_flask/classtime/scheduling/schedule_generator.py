
from angular_flask.logging import logging
logging = logging.getLogger(__name__)

import heapq

from .schedule import Schedule

class ScheduleGenerator(object):
    """Generates schedules
    """

    CANDIDATE_POOL_SIZE = 50
    """Number of schedules to keep in consideration at any one time"""

    def __init__(self, cal, schedule_params):
        """
        :param AcademicCalendar cal: calendar to pull section data from
        :param dict schedule_params: parameters to build the schedule with.
            Check :ref:`api/generate-schedules <api-generate-schedules>`
            for available parameters.
        """
        if 'term' not in schedule_params:
            logging.warning('In ScheduleGenerator(), schedule_params'\
                           +'does not have \'term\' field')
        term = schedule_params.get('term', '1490')

        if 'courses' not in schedule_params:
            logging.warning('In ScheduleGenerator(), schedule_params'\
                           +'is missing \'courses\' field')
        self._course_ids = schedule_params.get('courses', list())

        self._busy_times = schedule_params.get('busy-times', list())

        self._cal = cal
        self._cal.select_current_term(term)

    def generate_schedules(self, num_requested):
        """Generate a finite number of schedules

        :param int num_requested: maximum number of schedules to return.
            Upper limit is ScheduleGenerator.CANDIDATE_POOL_SIZE.
            Will only return valid schedules, even if that means returning
            less than the requested number.

        :returns: best schedules, constrained by initial conditions
        :rtype: list of :ref:`schedule objects <api-schedule-object>`
        """
        logging.info('Making schedules for courses {}'.format(self._course_ids))

        components = self._cal.get_components_for_course_ids(self._course_ids)
        candidates = [Schedule(busy_times=self._busy_times)]
        sections_chosen = 0
        for sections in components:
            logging.debug('Scheduling {}:{}\t({}/{})'.format(
                sections[0].get('asString'),
                sections[0].get('component'),
                Schedule.SYMBOLS[sections_chosen],
                len(components)))
            for candidate in candidates[:]:
                if len(candidate.sections) < sections_chosen:
                    continue
                for section in sections:
                    if candidate.conflicts(section):
                        continue
                    new_candidate = candidate.clone().add_section(section)
                    worst = heapq.heapreplace(candidates, new_candidate)
                    if len(candidates) < ScheduleGenerator.CANDIDATE_POOL_SIZE:
                        heapq.heappush(candidates, worst)
            sections_chosen += 1
            

        candidates = [candidate for candidate in candidates
                      if len(candidate.sections) == sections_chosen]
        return sorted(candidates, reverse=True)[:num_requested]
