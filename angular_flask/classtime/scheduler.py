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
        courses = Scheduler.normalize_schedules(courses)
        courses = sorted(courses, key=lambda course: len(course['sections']))
        schedule = Schedule()
        for course in courses:
            for section in course.get('sections'):
                pass

    @staticmethod
    def normalize_schedules(courses):
        """
        Takes a list of courses, as described in generate_schedule.

        Returns a list of course objects more suitable for analysis,
        ie using the `day`, `startTime`, and `endTime` to produce a
        **NEW FIELD**: 'schedule', which is an object of class Schedule
        """
        for course in courses:
            for section in course.get('sections'):
                section['schedule'] = Schedule(section)

import re
import sys
class Schedule(object):
    NUM_BLOCKS = 24*2
    SCHOOL_DAYS = 5

    BUSY = 1
    OPEN = None

    DAYS = 'MTWRF'

    def __init__(self, sections=[]):
        self.schedule = [[None]*Schedule.NUM_BLOCKS
                         for _ in range(Schedule.SCHOOL_DAYS)]
        # sections needs to be a list
        if not isinstance(sections, list):
            sections = [sections]
        if sections is not None:
            for section in sections:
                self._add(section)

    def __repr__(self):
        retstr = ''
        for day, daynum in zip(self.schedule, range(len(self.schedule))):
            retstr += '{}: '.format(Schedule.DAYS[daynum])
            for block in day:
                if block == Schedule.BUSY:
                    retstr += '*'
                else:
                    retstr += 'O'
            retstr += '\n'
        return retstr

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

    def _add(self, section):
        """
        Takes a section which MUST contain at the bare minimum
        the keys: ['day', 'startTime', 'endTime']

        Adds the section to the schedule
        """
        days = section.get('day')
        start = section.get('startTime')
        end = section.get('endTime')
        if days is None or start is None or end is None:
            raise ValueError('invalid section passed to Schedule::add()')

        start = Schedule._timestr_to_blocknum(start)
        end = Schedule._timestr_to_blocknum(end)
        for day in days:
            self._add_to_schedule(day, start, end)

    def _add_to_schedule(self, day, start, end):
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
