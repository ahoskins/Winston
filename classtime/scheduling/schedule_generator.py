
import threading

from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

import heapq

from .schedule import Schedule

def add_candidate(candidates, candidate, heap_size):
    discard = heapq.heapreplace(candidates, candidate)
    if len(candidates) < heap_size:
        heapq.heappush(candidates, discard)

def is_hopeless(candidate, sections_chosen):
    return len(candidate.sections) < sections_chosen

# http://stackoverflow.com/questions/6893968/how-to-get-the-return-value-from-a-thread-in-python
# http://stackoverflow.com/a/14331755/1817465
def threaded(f, daemon=False):
    import Queue

    def wrapped_f(q, *args, **kwargs):
        '''this function calls the decorated function and puts the 
        result in a queue'''
        ret = f(*args, **kwargs)
        q.put(ret)

    def wrap(*args, **kwargs):
        '''this is the function returned from the decorator. It fires off
        wrapped_f in a new thread and returns the thread object with
        the result queue attached'''
        q = Queue.Queue()

        t = threading.Thread(target=wrapped_f, args=(q,)+args, kwargs=kwargs)
        t.daemon = daemon
        t.start()
        t.result_queue = q        
        return t

    return wrap

@threaded
def get_best_candidates(candidates, sections, sections_chosen):
    """Returns the N best schedules in this chunk of the candidate pool
    of schedules

    :param list chunk: schedules to sort
    :returns: the N best schedules
    :rtype: list of candidate schedules
    """
    for candidate in candidates[:]:
        if is_hopeless(candidate, sections_chosen):
            continue
        for section in sections:
            if candidate.conflicts(section):
                continue
            add_candidate(candidates,
                candidate.clone().add_section(section),
                ScheduleGenerator.CHUNK_SIZE+1)
    return candidates

class ScheduleGenerator(object): # pylint: disable=R0903
    """Generates schedules
    """

    CANDIDATE_POOL_SIZE = 50
    CHUNK_SIZE = 25
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
            logging.debug('({symbol}/{num}) Scheduling {name}:{type}'.format(
                symbol=Schedule.SYMBOLS[sections_chosen],
                num=len(components),
                name=sections[0].get('asString'),
                type=sections[0].get('component')))
            workers = list()
            for chunk in ScheduleGenerator.chunks(candidates):
                workers.append(get_best_candidates(candidates=chunk,
                               sections=sections,
                               sections_chosen=sections_chosen))
            candidates = [candidate
                          for worker in workers
                          for candidate in worker.result_queue.get()]
            candidates = candidates[:ScheduleGenerator.CANDIDATE_POOL_SIZE]
            sections_chosen += 1

        candidates = [candidate for candidate in candidates
                      if len(candidate.sections) == sections_chosen]
        return sorted(candidates, reverse=True)[:num_requested]

    # http://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks-in-python
    @staticmethod
    def chunks(full_list, chunk_size=None):
        """ Yield successive n-sized chunks from l.
        """
        if chunk_size is None:
            chunk_size = ScheduleGenerator.CHUNK_SIZE
        for i in xrange(0, len(full_list), chunk_size):
            yield full_list[i:i+chunk_size]
