class Scheduler(object):
    """
    Helper class which builds optimal schedules out of 
    class listings.

    Use static methods only - do not create instances of
    the class.
    """
    def __init__(self):
        pass

    @staticmethod
    def generate_schedule(courses):
        """
        Generates one good schedule based on the courses
        provided.

        courses should be a list of course dictionaries,
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
        self.course_list = sorted(course_list,
                                  key=lambda course: len(course.get('sections')))
        self.generated_schedules = []

    def get_schedules(self, num_schedules=1):
        """Returns `num_schedules` schedule objects generated from
        the course_list passed upon initialization
        """
        for _ in range(num_schedules):
            self._generate_schedule()
        return self.generated_schedules

    def _generate_schedule(self):
        """
        Generates one good schedule based on the course list
        provided on initialization.

        The schedule generated returned will *not* be one
        of the schedules already in self.generated_schedules

        DEV NOTE: There are two solid ways to solve this:
        1) Backtracking - just do a depth-first search of the
            courses
            - If a section conflicts, try the next section
            - If all of a course's sections conflict,
            backtrack and pick a new section for the previously
            processed course
            - Dumb, easy
            - Difficult to extend to arbitrary cost functions
        2) Dijkstra - a breadth-first search of the state-space
            - Node := schedule
            - Adjacent nodes := all sections in the next course to be explored
            - Destination nodes := schedules containing all input courses
            - Find the least-cost-path to destination nodes
            - Path is defined as all sections in a schedule
            - Cost is calculated based on:
                - Conflict => infinity
                - No Conflict => zero
                - Alternative cost functions
                    - eg sleep-in, compactness, done early, with friends
            - Maintain a priority queue of nodes to explore
                - Priority is measured as the cost to reach a node
        """
        pass

import re
class Schedule(object):
    """
    Represents a 5-day week of 24-hour days, split into
    30-minute blocks.
    """
    NUM_BLOCKS = 24*2
    SCHOOL_DAYS = 5

    OPEN = None
    BUSY = 1

    DAYS = 'MTWRF'

    def __init__(self, sections=[]):
        self.schedule = [[None]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.SCHOOL_DAYS)]
        # sections needs to be a list
        if sections is None:
            sections = []
        elif not isinstance(sections, list):
            sections = [sections]

        for section in sections:
            self.add_section(section)

    def __repr__(self):
        retstr = ''
        for day, daynum in zip(self.schedule, range(len(self.schedule))):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in day:
                if block == Schedule.BUSY:
                    retstr += '*'
                else:
                    retstr += '-'
            retstr += '\n'
        return retstr[:-1] # strip last newline

    def conflicts(self, other):
        """
        Returns true if there is a conflict between:
        1) this schedule (self), and
        2) other, which is a section dict containing at LEAST
           the properties 'day', 'startTime', and 'endTime'
        """
        other = Schedule(other)
        print self
        print other
        for ourday, theirday in zip(self.schedule, other.schedule):
            for ourblock, theirblock in zip(ourday, theirday):
                if ourblock == Schedule.BUSY and theirblock == Schedule.BUSY:
                    return True
        return False

    def add_section(self, section):
        """
        Takes a section which MUST contain at the bare minimum
        the keys: ['day', 'startTime', 'endTime']

        Adds the section to the schedule
        """
        days = section.get('day')
        start = section.get('startTime')
        end = section.get('endTime')
        if days is None or start is None or end is None:
            raise ValueError('invalid section passed to Schedule::add_section()')

        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_by_block(day, start, end)

    def _add_by_block(self, day, start, end):
        daynum = Schedule._daystr_to_daynum(day)
        for i in range(end-start+1):
            self.schedule[daynum][start + i] = Schedule.BUSY

    @staticmethod
    def _timestr_to_blocknum(time):
        if not isinstance(time, str):
            raise ValueError('time must be string object')
        m = re.search('(\d\d):(\d\d) (\w\w)', time)
        if m is None:
            raise ValueError(r'time must match "\d\d:\d\d [AP]M\nGiven: "{}"'.format(time))
        hour = int(m.group(1))
        minute = int(m.group(2))
        ampm_offset = (12 if m.group(3) == 'PM' else 0)

        block = (hour+ampm_offset)*2 + minute/30
        return block

    @staticmethod
    def _daystr_to_daynum(daystr):
        if daystr not in Schedule.DAYS:
            raise ValueError('daystr must be in "{}"'.format(Schedule.DAYS))
        return Schedule.DAYS.index(daystr)
