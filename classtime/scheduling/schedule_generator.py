
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

def generate_schedules(institution, schedule_params, num_requested):
    """
    :param AcademicCalendar cal: calendar to pull section data from
    :param dict schedule_params: parameters to build the schedule with.
        Check :ref:`api/generate-schedules <api-generate-schedules>`
        for available parameters.
    """
    if 'term' not in schedule_params:
        logging.error("schedule_params is missing 'term' field")
    term = schedule_params.get('term', '1490')
    cal = classtime.get_calendar(institution)
    cal.select_active_term(term)

    if 'courses' not in schedule_params:
        logging.error("schedule_params is missing 'courses' field")
    course_ids = schedule_params.get('courses', list())
    busy_times = schedule_params.get('busy-times', list())

    return _generate_schedules(cal, course_ids, busy_times, num_requested)

def _generate_schedules(cal, course_ids, busy_times, num_requested):
    """Generate a finite number of schedules

    :param int num_requested: maximum number of schedules to return.
        Upper limit is CANDIDATE_POOL_SIZE.
        Will only return valid schedules, even if that means returning
        less than the requested number.

    :returns: the best possible schedules, sorted by ScheduleScorer
        scoring functions
    :rtype: list of :ref:`schedule objects <api-schedule-object>`
    """
    logging.info('Finding schedules for courses {}'.format(course_ids))

    components = _get_components(cal, course_ids)
    components = sorted(components, key=len)

    candidates = [Schedule(busy_times=busy_times)]
    for pace, component in enumerate(components):
        logging.debug('({symbol}/{num}) Scheduling {name}:{type}'.format(
            symbol=Schedule.SYMBOLS[pace],
            num=len(components),
            name=component[0].get('asString'),
            type=component[0].get('component')))
        candidates = _add_component(candidates, component, pace)

    candidates = [candidate for candidate in candidates
                  if len(candidate.sections) == len(components)]
    if len(candidates) == 0:
        logging.error('No schedules found')
    return sorted(candidates, reverse=True)[:num_requested]

def _get_components(cal, course_ids):
    """Get a list of components which are present in these course ids"""
    out_q = multiprocessing.Queue()
    procs = list()
    for course_id in course_ids:
        proc = multiprocessing.Process(
            target=_put_components_on_queue,
            args=(cal, course_id, out_q))
        procs.append(proc)
        proc.start()
    components = list()
    for _ in range(len(procs)):
        components.extend(out_q.get())
    for proc in procs:
        proc.join()
    return components

def _put_components_on_queue(cal, course_id, out_q):
    """Put this course's components onto the `out_q`

    Should only put a single object onto the queue. Likely,
    this will be a list of (lists of sections)

    :param AcademicCalendar cal: the calendar to read from
    :param str course_id: :ref:`6-digit course identifier 
        <6-digit-course-identifier>`
    :param multiprocessing.Queue out_q: queue to put the
        results on
    """
    out_q.put([component        # generator, not function
               for component in cal.get_components(course_id)])

def _add_component(candidates, component, pace):
    out_q = multiprocessing.Queue()
    procs = list()
    for chunk in _chunks(candidates):
        proc = multiprocessing.Process(
            target=_candidate_battle_royale,
            args=(chunk, component, pace,
                  WORKLOAD_SIZE+1, out_q))
        procs.append(proc)
        proc.start()
    candidates = list()
    for _ in range(len(procs)):
        candidates.extend(out_q.get())
    candidates = candidates[:CANDIDATE_POOL_SIZE]
    for proc in procs:
        proc.join()
    return candidates

def _candidate_battle_royale(candidates, component, pace, heap_size, out_q):
    """Put the `heap_size` best candidates onto the `out_q`

    :param list candidates: candidate schedules
    :param list component: sections to consider. Exactly one is added to any
        given schedule.
    :param int pace: the number of components which should already have been
        added to a schedule. If a schedule has less than this, it can never
        be a complete schedule. Therefore, time should not be wasted on it.
    :param int heap_size: number of candidate schedules which should escape
        alive
    :param multiprocessing.Queue out_q: a multiprocessing Queue to put results
        onto.

    :returns: the best schedules
    :rtype: list of schedules
    """
    for candidate in candidates[:]:
        if _is_hopeless(candidate, pace):
            continue
        for section in component:
            if candidate.conflicts(section):
                continue
            _add_candidates(candidates,
                candidate.clone().add_section(section),
                heap_size)
    out_q.put(candidates)

def _add_candidates(candidates, candidate, heap_size):
    discard = heapq.heapreplace(candidates, candidate)
    if len(candidates) < heap_size:
        heapq.heappush(candidates, discard)

def _is_hopeless(candidate, sections_chosen):
    return len(candidate.sections) < sections_chosen

# http://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks-in-python
def _chunks(full_list, chunk_size=None):
    """ Yield successive n-sized chunks from l.
    """
    if chunk_size is None:
        chunk_size = WORKLOAD_SIZE
    for i in xrange(0, len(full_list), chunk_size):
        yield full_list[i:i+chunk_size]
