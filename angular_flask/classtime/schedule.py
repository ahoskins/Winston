
import re
import copy

from angular_flask.logging import logging

class Schedule(object):
    """
    Represents a 5-day week of 24-hour days, split into
    30-minute blocks.
    """
    NUM_BLOCKS = 24*2

    NUM_DAYS = 5
    DAYS = 'MTWRF'

    OPEN = 0
    SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    def __init__(self, sections=None):
        self.schedule = [[Schedule.OPEN]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.NUM_DAYS)]
        self._schedule_bitmap = [0 for _ in range(Schedule.NUM_DAYS)]
        # sections needs to be a list
        if sections is None:
            sections = []
        elif not isinstance(sections, list):
            sections = [sections]

        self.sections = []

        for section in sections:
            self.add_section(section)

    def __repr__(self):
        retstr = '\n'
        for day, daynum in zip(self.schedule, range(len(self.schedule))):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in day:
                if block == Schedule.OPEN:
                    retstr += '-'
                else:
                    retstr += Schedule.SYMBOLS[block]
            retstr += '\n'
        return retstr[:-1] # strip last newline

    def __lt__(self, other):
        """
        This is where all cost functions will be performed


        """
        if len(self.sections) < len(other.sections):
            return True
        if len(self.sections) > len(other.sections):
            return False
        return False # more cost functions go here

    def conflicts(self, section):
        """
        Returns true if there is a conflict between:
        1) this schedule (self), and
        2) other, which is a section dict containing at LEAST
           the properties 'day', 'startTime', and 'endTime'
        """
        other = Schedule(section)
        for day in range(Schedule.NUM_DAYS):
            if other._schedule_bitmap[day] & self._schedule_bitmap[day] != 0:
                return True
        return False

    def add_section(self, section):
        """
        Takes a section which MUST contain at the bare minimum
        the keys: ['day', 'startTime', 'endTime']

        Adds the section to the schedule
        """
        self.sections.append(section)
        days = section.get('day')
        start = section.get('startTime')
        end = section.get('endTime')
        if days is None or start is None or end is None:
            return

        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_by_block(day, start, end, self.sections.index(section))

    def add_section_and_deepcopy(self, section):
        ret = copy.deepcopy(self)
        ret.add_section(section)
        return ret

    def _add_by_block(self, day, start, end, section_num):
        daynum = Schedule._daystr_to_daynum(day)
        for i in range(end-start+1):
            self._schedule_bitmap[daynum] += (1 << start + i)
            self.schedule[daynum][start + i] = section_num+1

    @staticmethod
    def _timestr_to_blocknum(time):
        if not isinstance(time, str):
            # logging.debug('in _timestr_to_blocknum, time was not instance of str')
            # logging.debug('time: {}'.format(time))
            # logging.debug('casting to str and continuing')
            time = str(time)
        m = re.search('(\d\d):(\d\d) (\w\w)', time)
        if m is None:
            raise ValueError(r'time must match "\d\d:\d\d [AP]M\nGiven: "{}"'.format(time))
        hour = int(m.group(1))
        minute = int(m.group(2))
        ampm_offset = 0
        if hour != 12 and m.group(3) == 'PM':
            ampm_offset = 12

        block = (hour+ampm_offset)*2 + minute/30
        return block

    @staticmethod
    def _daystr_to_daynum(daystr):
        if daystr not in Schedule.DAYS:
            raise ValueError('daystr must be in "{}"'.format(Schedule.DAYS))
        return Schedule.DAYS.index(daystr)
