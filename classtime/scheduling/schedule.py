
from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

import re

class Schedule(object):
    """Represents a 5-day week of 24-hour days

    Each day is split into 48 thirty-minute blocks
    """
    NUM_BLOCKS = 24*2
    """Number of blocks in one day"""

    NUM_DAYS = 5
    DAYS = 'MTWRF'
    """Number of days in a week, and the letters representing each"""

    OPEN = -1
    """Nothing schedule in this block"""
    BUSY = -2
    """This block is busy with a non-school activity"""
    SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWx '
    """Symbols used for drawing a Schedule to the console"""

    SELF_IS_WORSE = True
    SELF_IS_BETTER = False
    """Semantic sorting constants"""

    def __init__(self, sections=None, busy_times=None):
        """Creates a schedule with the given initial conditions

        :param sections: one or more sections to include in the
                         class-schedule and the timetable
        :type sections: section dict or list of section dicts

        :param busy_times: one or more sections to include only
                           in the timetable
        :type busy_times: section dict or list of section dicts
        """
        self.timetable = [[Schedule.OPEN]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.NUM_DAYS)]
        self.timetable_bitmap = [0 for _ in range(Schedule.NUM_DAYS)]

        self.scorer = ScheduleScorer(self)

        self.sections = list()
        self._add_initial_sections(sections)
        self.busy_times = list()
        self._add_initial_busy_times(busy_times)        

    def __repr__(self):
        retstr = '\n   0 1 2 3 4 5 6 7 8 9 A B C 1 2 3 4 5 6 7 8 9 A B \n'
        for daynum, blocks in enumerate(self.timetable):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in blocks:
                retstr += Schedule.SYMBOLS[block]
            retstr += '\n'
        return retstr[:-1] # remove trailing newline

    def _add_initial_sections(self, sections):
        """Add sections when building a new :py:class:`Schedule`

        :param sections: one or more sections to add
        :type sections: section dict or list of section dicts
        """
        if sections is not None:
            if not isinstance(sections, list):
                sections = [sections]
            for section in sections:
                self.add_section(section)

    def _add_initial_busy_times(self, busy_times):
        """Add busy_times when building a new :py:class:`Schedule`

        :param busy_times: one or more busy_times to add
        :type busy_times: section dict or list of section dicts
        """
        if busy_times is not None:
            if not isinstance(busy_times, list):
                busy_times = [busy_times]
            for busy_time in busy_times:
                self.add_busy_time(busy_time)

    def add_section(self, section):
        """Attempts to add a section to the timetable.
        On success, adds it to the section list.

        :param section: the section to add
        :type section: section dict

        If a section has null timetable info (day, startTime, endTime),
        it will not be added.
        """
        try:
            self.attempt_add_to_timetable(section, len(self.sections))
        except ValueError:
            pass
        else:
            self.scorer.update()
        self.sections.append(section)
        return self

    def add_busy_time(self, busy_time):
        """Attempts to add a busy_time to the timetable.
        On success, adds it to the busy_time list.

        :param busy_time: the busy_time to add
        :type busy_time: section dict

        If a busy_time has null timetable info (day, startTime, endTime),
        it will not be added.
        """
        try:
            self.attempt_add_to_timetable(busy_time, Schedule.BUSY)
        except ValueError:
            logging.error('Failed to schedule busy time {}'\
                .format(busy_time))
        else:
            self.busy_times.append(busy_time)
        return self

    def conflicts(self, section):
        """Checks for a conflict between this :py:class:`Schedule`
        and a section

        :param section: the section to check for conflicts with
        :type sections: section dict

        :returns: whether it conflicts or not
        :rtype: boolean
        """
        other = Schedule(section)
        for day in range(Schedule.NUM_DAYS):
            if other.timetable_bitmap[day] & self.timetable_bitmap[day] != 0:
                return True
        return False

    def attempt_add_to_timetable(self, section, section_num):
        """Attempts to add a section to the timetable

        :param section: the section to add
        :type section: section dict
        :param int section_num: the index of :py:attr:`Schedule.SYMBOLS` to
                                represent this section with
        :raises ValueError: if one or more of:
                            * day
                            * startTime
                            * endTime
                            is null
        """
        days = section.get('day')
        start = section.get('startTime')
        end = section.get('endTime')
        if None in [days, start, end]:
            raise ValueError(section.get('class_', '??'))
        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_to_timetable(day, start, end, section_num)            

    def _add_to_timetable(self, day, start, end, section_num):
        """Adds one or more blocks to the timetable

        :param day: the timetable day to add to
        :type day: str of length one
        :param int start: the first block
        :param int end: the last block (inclusive)
        :param int section_num: the index of Schedule.SYMBOLS to
                                represent these blocks with
        """
        daynum = Schedule._daystr_to_daynum(day)
        for block in range(start, end+1):
            self.timetable_bitmap[daynum] += 1 << (Schedule.NUM_BLOCKS-block-1)
            self.timetable[daynum][block] = section_num

    def clone(self):
        """Clones this schedule

        :returns: a new schedule with identical
                  * section list
                  * busy_time list
                  * timetable
        :rtype: Schedule
        """
        return Schedule(sections=self.sections,
                        busy_times=self.busy_times)

    def __lt__(self, other):
        if len(self.sections) > len(other.sections):
            return Schedule.SELF_IS_BETTER
        elif len(self.sections) < len(other.sections):
            return Schedule.SELF_IS_WORSE

        this_score = self.scorer.read('overall')
        other_score = other.scorer.read('overall')
        if this_score < other_score:
            return Schedule.SELF_IS_WORSE
        else:
            return Schedule.SELF_IS_BETTER

    @staticmethod
    def _timestr_to_blocknum(time):
        """Converts a time string to a block number

        :param str time: string in :ref:`time format <time-format>`
        :returns: block number this time is inside of
        :rtype: int

        :raises ValueError: if time does not match
                            :ref:`time format <time-format>`
        """
        if not isinstance(time, str):
            time = str(time)
        match = re.search(r'(\d\d):(\d\d) (\w\w)', time)
        if match is None:
            raise ValueError(r'time must match "\d\d:\d\d [AP]M')
        hour = int(match.group(1))
        minute = int(match.group(2))
        ampm_offset = 0
        if hour != 12 and match.group(3) == 'PM':
            ampm_offset = 12

        block = (hour+ampm_offset)*2 + minute/30
        return block

    @staticmethod
    def _daystr_to_daynum(day):
        """Converts a day string to a day number

        :param day: day in Schedule.DAYS
        :type day: str of length one
        :returns: day number this day string represents

        :raises ValueError: if day is not in Schedule.DAYS
        """
        if day not in Schedule.DAYS:
            raise ValueError('day must be in "{}"'.format(Schedule.DAYS))
        return Schedule.DAYS.index(day)

class ScheduleScorer(object):
    """Scores a schedule using a suite of scoring functions
    """
    def __init__(self, schedule):
        """Creates a new ScheduleScorer to score the given schedule

        :param Schedule schedule: the schedule to be scored
        """
        self.schedule = schedule
        self.score_values = dict()
        self.score_info = {
            'no-marathons': {
                'weight': 10,
                'function': self._no_marathons
            },
            'day-classes': {
                'weight': 10,
                'function': self._day_classes
            },
            'start-early': {
                'weight': 1000,
                'function': self._start_early
            }
        }

    def read(self, name='all'):
        """Returns a particular score, or all scores

        :param str name: the name of a particular scoring function.
                         Defaults to 'all', which returns a dictionary
                         of all scoring functions and their values.
                         **Special value:** 'overall', which is a
                         weighted sum of all scores.
        """
        if name == 'all':
            return self.score_values
        else:
            return self.score_values.get(name)

    def update(self):
        """Update all scores by calculating them individually

        Also calculates 'overall', which is a weighted sum of all
        scoring functions.
        """
        for name in self.score_info.keys():
            self.score_values.update({
                name: self._weight(name) * self._score(name)
            })
        self.score_values.update({
            'overall': sum(self.score_values.values())
        })

    def _weight(self, name):
        """Return the weight of a particular scoring function

        :param str name: the name of the scoring function
        """
        info = self.score_info.get(name)
        if info is not None:
            return info.get('weight', 1)
        return None

    def _score(self, name):
        """Run a particular scoring function, and return its result

        :param str name: the name of the scoring function
        """
        info = self.score_info.get(name)
        if info is not None:
            return info.get('function', lambda: 0)()
        else:
            return 0

    def _no_marathons(self):
        """Scores based on the class spread throughout the day

        * + weight: spread out. More breaks in between classes
        * 0 weight: -no effect-
        * - weight: clumped up. Less breaks in between classes
        """
        total = 0
        for day_bitmap in self.schedule.timetable_bitmap[:]:
            max_consecutive = 0
            while day_bitmap:
                day_bitmap &= (day_bitmap << 1)
                max_consecutive += 1
            total += max_consecutive
        frac_of_nightmare = total / (5*Schedule.NUM_DAYS)
        return -1 * 10 * frac_of_nightmare

    def _day_classes(self):
        """Scores based on having day classes versus night classes

        * + weight: classes end before 5pm
        * 0 weight: -no effect-
        * - weight: classes start at or after 5pm
        """
        #               0 1 2 3 4 5 6 7 8 9 A B C 1 2 3 4 5 6 7 8 9 A B 
        bad_zone = int('111111111111111100000000000000000011111111111111', 2)
        num_outside = 0
        for day_bitmap in self.schedule.timetable_bitmap:
            in_bad_zone = day_bitmap & bad_zone
            num_outside += bin(in_bad_zone).count('1')
        score = -1*num_outside
        return 1 * 50 * score

    def _start_early(self):
        """Scores based on starting early or late

        * + weight: start early
        * 0 weight: -no effect-
        * - weight: start late
        """
        score = 0
        early_block = 8*2
        ideal_start_bitmap = (1 << (Schedule.NUM_BLOCKS - early_block -1))
        for day_bitmap in self.schedule.timetable_bitmap[:]:
            if day_bitmap == 0:
                continue
            while day_bitmap < ideal_start_bitmap:
                day_bitmap <<= 1
                score -= 1
        return 1 * score
