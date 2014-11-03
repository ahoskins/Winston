
import re
import schedule_scorer

class Schedule(object):
    """
    Represents a 5-day week of 24-hour days.
    Each day is split into 30-minute blocks.
    """
    NUM_BLOCKS = 24*2

    NUM_DAYS = 5
    DAYS = 'MTWRF'

    OPEN = -1
    BUSY = -2
    SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWx '

    # Semantic sorting constants
    SELF_IS_WORSE = True
    SELF_IS_BETTER = False

    def __init__(self, sections=None, busy_times=None):
        
        self.schedule = [[Schedule.OPEN]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.NUM_DAYS)]
        self.conflict_bitmap = [0 for _ in range(Schedule.NUM_DAYS)]
        self.scorer = schedule_scorer.ScheduleScorer()

        self.sections = list()
        self._add_initial_sections(sections)
        self.busy_times = list()
        self._add_initial_busy_times(busy_times)        

    def __repr__(self):
        retstr = '\n   0 1 2 3 4 5 6 7 8 9 A B C 1 2 3 4 5 6 7 8 9 A B \n'
        for daynum, blocks in enumerate(self.schedule):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in blocks:
                retstr += Schedule.SYMBOLS[block]
            retstr += '\n'
        return retstr[:-1] # strip last newline

    def __lt__(self, other):
        """Sort schedules
        """
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

    def _add_initial_sections(self, sections):
        if sections is not None:
            if not isinstance(sections, list):
                sections = [sections]
            for section in sections:
                self.add_section(section)

    def _add_initial_busy_times(self, busy_times):
        if busy_times is not None:
            if not isinstance(busy_times, list):
                busy_times = [busy_times]
            for busy_time in busy_times:
                self.busy_times.append(busy_time)
                self.add_conflict(busy_time, Schedule.BUSY)

    def conflicts(self, section):
        """
        Returns true if there is a conflict between:
        1) this schedule (self), and
        2) other, which is a section dict containing at LEAST
           the properties 'day', 'startTime', and 'endTime'
        """
        other = Schedule(section)
        for day in range(Schedule.NUM_DAYS):
            if other.conflict_bitmap[day] & self.conflict_bitmap[day] != 0:
                return True
        return False

    def add_section(self, section):
        """
        Takes a section which MUST contain at the bare minimum
        the keys: ['day', 'startTime', 'endTime']

        Adds the section to the schedule
        """
        self.sections.append(section)
        self.add_conflict(section, self.sections.index(section))
        self.scorer.score(self)
        return self

    def add_conflict(self, section, section_num):
        days = section.get('day')
        start = section.get('startTime')
        end = section.get('endTime')
        if days is None or start is None or end is None:
            return

        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_by_block(day, start, end, section_num)

    

    def clone(self):
        return Schedule(sections=self.sections,
                        busy_times=self.busy_times)

    def _add_by_block(self, day, start, end, section_num):
        daynum = Schedule._daystr_to_daynum(day)
        for blocknum in range(start, end+1):
            self.conflict_bitmap[daynum] += (1 << (Schedule.NUM_BLOCKS - blocknum -1))
            self.schedule[daynum][blocknum] = section_num

    # ---------------------------
    # Static Methods
    # ---------------------------
    @staticmethod
    def _timestr_to_blocknum(time):
        if not isinstance(time, str):
            time = str(time)
        match = re.search(r'(\d\d):(\d\d) (\w\w)', time)
        if match is None:
            raise ValueError('time must match "\d\d:\d\d [AP]M')
        hour = int(match.group(1))
        minute = int(match.group(2))
        ampm_offset = 0
        if hour != 12 and match.group(3) == 'PM':
            ampm_offset = 12

        block = (hour+ampm_offset)*2 + minute/30
        return block

    @staticmethod
    def _daystr_to_daynum(daystr):
        if daystr not in Schedule.DAYS:
            raise ValueError('daystr must be in "{}"'.format(Schedule.DAYS))
        return Schedule.DAYS.index(daystr)
