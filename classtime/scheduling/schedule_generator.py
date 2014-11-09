
import multiprocessing
import classtime

from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

import heapq

from .schedule import Schedule

CANDIDATE_POOL_SIZE = 120
"""Number of schedules to keep in consideration at any one time"""

WORKERS = 16
"""Maximum number of worker processes to spawn"""

WORKLOAD_SIZE = CANDIDATE_POOL_SIZE / WORKERS
"""Number of candidate schedules to give to each worker process"""

# http://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks-in-python
def _chunks(full_list, chunk_size=None):
    """ Yield successive n-sized chunks from l.
    """
    if chunk_size is None:
        chunk_size = WORKLOAD_SIZE
    for i in xrange(0, len(full_list), chunk_size):
        yield full_list[i:i+chunk_size]

def _add_candidates(candidates, candidate, heap_size):
    discard = heapq.heapreplace(candidates, candidate)
    if len(candidates) < heap_size:
        heapq.heappush(candidates, discard)

def _is_hopeless(candidate, sections_chosen):
    return len(candidate.sections) < sections_chosen

def _get_candidates(candidates, sections, sections_chosen, heap_size, out_q):
    """Returns the N best schedules in this chunk of the candidate pool
    of schedules

    :param list chunk: schedules to sort
    :returns: the N best schedules
    :rtype: list of candidate schedules
    """
    for candidate in candidates[:]:
        if _is_hopeless(candidate, sections_chosen):
            continue
        for section in sections:
            if candidate.conflicts(section):
                continue
            _add_candidates(candidates,
                candidate.clone().add_section(section),
                heap_size)
    out_q.put(candidates)

def generate_schedules(institution, schedule_params, num_requested):
    """
    :param AcademicCalendar cal: calendar to pull section data from
    :param dict schedule_params: parameters to build the schedule with.
        Check :ref:`api/generate-schedules <api-generate-schedules>`
        for available parameters.
    """
    if 'term' not in schedule_params:
        logging.warning("schedule_params does not have 'term' field")
    term = schedule_params.get('term', '1490')
    cal = classtime.get_calendar(institution)
    cal.select_current_term(term)

    if 'courses' not in schedule_params:
        logging.warning("schedule_params is missing 'courses' field")
    course_ids = schedule_params.get('courses', list())
    busy_times = schedule_params.get('busy-times', list())

    return _generate_schedules(cal, course_ids, busy_times, num_requested)

def _generate_schedules(cal, course_ids, busy_times, num_requested):
    """Generate a finite number of schedules

    :param int num_requested: maximum number of schedules to return.
        Upper limit is CANDIDATE_POOL_SIZE.
        Will only return valid schedules, even if that means returning
        less than the requested number.

    :returns: best schedules, constrained by initial conditions
    :rtype: list of :ref:`schedule objects <api-schedule-object>`
    """
    logging.info('Making schedules for courses {}'.format(course_ids))

    components = cal.get_components_for_course_ids(course_ids)
    candidates = [Schedule(busy_times=busy_times)]
    sections_chosen = 0
    for sections in components:
        logging.debug('({symbol}/{num}) Scheduling {name}:{type}'.format(
            symbol=Schedule.SYMBOLS[sections_chosen],
            num=len(components),
            name=sections[0].get('asString'),
            type=sections[0].get('component')))
        out_q = multiprocessing.Queue()
        procs = []
        for chunk in _chunks(candidates):
            proc = multiprocessing.Process(
                target=_get_candidates,
                args=(chunk, sections, sections_chosen,
                      WORKLOAD_SIZE+1, out_q))
            procs.append(proc)
            proc.start()
        candidates = list()
        for _ in range(len(procs)):
            candidates.extend(out_q.get())
        candidates = candidates[:CANDIDATE_POOL_SIZE]
        sections_chosen += 1

        for proc in procs:
            proc.join()

    candidates = [candidate for candidate in candidates
                  if len(candidate.sections) == sections_chosen]
    return sorted(candidates, reverse=True)[:num_requested]
