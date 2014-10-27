
import heapq

from angular_flask.logging import logging
from angular_flask.classtime.schedule import Schedule

class ScheduleGenerator(object):
    """
    Class which builds optimal schedules out of
    course listings.
    """

    CANDIDATE_POOL_SIZE = 50

    def __init__(self, cal, term, course_ids):
        """
        cal := AcademicCalendar instance
        term := 4-digit unique term identifier
        course_ids := list of 6-digit unique course identifiers
        """
        self._course_ids = course_ids
        self._schedules_heapq = None

        self._cal = cal
        self._cal.select_current_term(term)

    def generate_schedules(self, num_requested):
        """
        Returns schedule objects generated from
        the courses passed upon initialization
        """
        logging.info('Making schedules for courses {}'.format(self._course_ids))
        components = self._cal.get_components_for_course_ids(self._course_ids)
        logging.debug('{} components to schedule'.format(len(components)))

        components = sorted(components, key=len)
        candidates = [Schedule()]
        sections_chosen = 0
        for sections in components:
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
            logging.debug('Scheduling {}:{}\t({}/{})'.format(
                          sections[0].get('asString'),
                          sections[0].get('component'),
                          sections_chosen,
                          len(components)))

        return sorted(candidates, reverse=True)[:num_requested]
