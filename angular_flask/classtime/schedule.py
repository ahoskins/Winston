
import re

class Schedule(object):
    """
    Represents a 5-day week of 24-hour days.
    Each day is split into 30-minute blocks.
    """
    NUM_BLOCKS = 24*2

    NUM_DAYS = 5
    DAYS = 'MTWRF'

    OPEN = -1
    SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-'

    # Semantic sorting constants
    SELF_IS_WORSE = True
    SELF_IS_BETTER = False

    def __init__(self, sections=None):
        self.schedule = [[Schedule.OPEN]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.NUM_DAYS)]
        self.schedule_bitmap = [0 for _ in range(Schedule.NUM_DAYS)]
        # sections needs to be a list
        if sections is None:
            sections = []
        elif not isinstance(sections, list):
            sections = [sections]

        self.score = 0
        self.sections = []
        for section in sections:
            self.add_section(section)

    def __repr__(self):
        retstr = '\n'
        for day, daynum in zip(self.schedule, range(len(self.schedule))):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in day:
                retstr += Schedule.SYMBOLS[block]
            retstr += '\n'
        return retstr[:-1] # strip last newline

    def __lt__(self, other):
        """
        This is where all cost functions will be performed
        """
        if len(self.sections) > len(other.sections):
            return Schedule.SELF_IS_BETTER
        elif len(self.sections) < len(other.sections):
            return Schedule.SELF_IS_WORSE

        if self.score < other.score:
            return Schedule.SELF_IS_WORSE
        else:
            return Schedule.SELF_IS_BETTER

    def conflicts(self, section):
        """
        Returns true if there is a conflict between:
        1) this schedule (self), and
        2) other, which is a section dict containing at LEAST
           the properties 'day', 'startTime', and 'endTime'
        """
        other = Schedule(section)
        for day in range(Schedule.NUM_DAYS):
            if other.schedule_bitmap[day] & self.schedule_bitmap[day] != 0:
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
            return self

        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_by_block(day, start, end, self.sections.index(section))

        self.score_schedule()
        return self

    def clone(self):
        return Schedule(self.sections)

    def _add_by_block(self, day, start, end, section_num):
        daynum = Schedule._daystr_to_daynum(day)
        for blocknum in range(start, end+1):
            self.schedule_bitmap[daynum] += (1 << blocknum)
            self.schedule[daynum][blocknum] = section_num

    # -------------------------------
    # Schedule Evaluation Functions
    #   used for sorting
    # -------------------------------
    def score_schedule(self):
        self.score = 0
        self.score += self._score_classes_in_a_row()
        self.score += self._score_ideal_busy_range()
        self.score += self._score_start_earlier()

    def _score_classes_in_a_row(self):
        """
        A schedule is better if it has a more even distribution
        of breaks throughout the day, and also if it squishes sections
        together so as to not waste time. Constantly alternating between
        class and break is bad. Having more than 3 hours in a row is bad.
        """
        max_consecutive_blocks = 3*2 # 3 hours x 2 blocks/hour
        score = 0
        schedule_bitmap_copy = list(self.schedule_bitmap)
        for day in range(Schedule.NUM_DAYS):
            consecutive_blocks = 0
            day_bitmap = schedule_bitmap_copy[day]
            while day_bitmap:
                day_bitmap &= (day_bitmap << 1)
                consecutive_blocks += 1
            num_blocks_too_many = consecutive_blocks - max_consecutive_blocks
            if num_blocks_too_many > 0:
                score -= num_blocks_too_many
        return score / 10.0

    def _score_ideal_busy_range(self):
        #               0 1 2 3 4 5 6 7 8 9 1011121 2 3 4 5 6 7 8 9 101112
        bad_zone = int('11111111111111111100000000000000001111111111111111', 2)

        for day in range(Schedule.NUM_DAYS):
            in_bad_zone = self.schedule_bitmap[day] & bad_zone
            num_outside = bin(in_bad_zone).count('1')
        return -1*num_outside / 10.0

    def _score_start_earlier(self):
        score = 0

        ideal_start_block = 8*2 # 8am
        ideal_start_bitmap = (1 << ideal_start_block)
        schedule_bitmap_copy = list(self.schedule_bitmap)
        for day in range(Schedule.NUM_DAYS):
            # Because a 1 further to the left (earlier in the day)
            # will always make a larger number
            if schedule_bitmap_copy[day] == 0:
                continue
            if schedule_bitmap_copy[day] > ideal_start_bitmap:
                score += 2
                continue
            while schedule_bitmap_copy[day] < ideal_start_bitmap:
                schedule_bitmap_copy[day] = schedule_bitmap_copy[day] << 1
                score -= 1
        return score

    # ---------------------------
    # Static Methods
    # ---------------------------
    @staticmethod
    def _timestr_to_blocknum(time):
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
    def _daystr_to_daynum(daystr):
        if daystr not in Schedule.DAYS:
            raise ValueError('daystr must be in "{}"'.format(Schedule.DAYS))
        return Schedule.DAYS.index(daystr)
