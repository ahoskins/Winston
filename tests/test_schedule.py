
from classtime.scheduling.schedule import Schedule

def check_add_section(section, numblocks_expected):
    """
    Check that adding a given section to a new Schedule
    - fills the expected number of schedule blocks, and
    - fills the correct schedule blocks
    """
    schedule = Schedule(section)
    numblocks = 0
    for day in schedule.timetable:
        for block in day:
            if block is not Schedule.OPEN:
                numblocks += 1
    assert numblocks == numblocks_expected

def test_add_section():
    """
    Test section dictionary addition to a Schedule
    object, including proper conversion of startTime
    and endTime strings to their proper schedule blocks
    """
    sections = [
        {
            'day': 'TR',
            'startTime': '08:00 AM',
            'endTime': '08:50 AM',

            'expectedBusyBlocks': 4
        },
        {
            'day': 'MTWRF',
            'startTime': '08:00 AM',
            'endTime': '08:50 AM',

            'expectedBusyBlocks': 10
        },
        {
            'day': 'TR',
            'startTime': '08:00 AM',
            'endTime': '08:50 PM',

            'expectedBusyBlocks': 52
        },
        {
            'day': 'TR',
            'startTime': '08:00 AM',
            'endTime': '09:20 AM',

            'expectedBusyBlocks': 6
        },
        {
            'day': 'M',
            'startTime': '06:00 PM',
            'endTime': '08:50 PM',

            'expectedBusyBlocks': 6
        }
    ]
    for section in sections:
        yield check_add_section, section, section['expectedBusyBlocks']

def check_conflict(sections, has_conflict):
    """
    Assert that a list of sections has either:
    - one or more conflicts, or
    - no conflicts
    """
    timetable = Schedule()
    for section in sections:
        if timetable.conflicts(section):
            assert has_conflict == True
            return
        else:
            timetable.add_section(section)
    assert has_conflict == False

def test_conflicts():
    """
    Test conflict detection between a schedule and
    a candidate section.
    """
    scenarios = [
        {
            'expected': True,
            'sections':
            [
                {
                    'day': 'TR',
                    'startTime': '08:00 AM',
                    'endTime': '08:50 AM'
                },
                {
                    'day': 'MTWRF',
                    'startTime': '08:00 AM',
                    'endTime': '08:50 AM'
                }
            ]
        },
        {
            'expected': False,
            'sections':
            [
                {
                    'day': 'TR',
                    'startTime': '08:00 AM',
                    'endTime': '08:50 AM'
                },
                {
                    'day': 'TR',
                    'startTime': '09:00 AM',
                    'endTime': '09:50 AM'
                }
            ]
        },
        {
            'expected': False,
            'sections':
            [
                {
                    'day': 'TR',
                    'startTime': '07:00 PM',
                    'endTime': '07:50 PM'
                },
                {
                    'day': 'TR',
                    'startTime': '08:00 PM',
                    'endTime': '09:00 PM'
                }
            ]
        },
        {
            'expected': True,
            'sections':
            [
                {
                    'day': 'TR',
                    'startTime': '07:00 PM',
                    'endTime': '07:50 PM'
                },
                {
                    'day': 'TR',
                    'startTime': '08:00 PM',
                    'endTime': '09:00 PM'
                },
                {
                    'day': 'TR',
                    'startTime': '08:30 PM',
                    'endTime': '08:50 PM'
                }
            ]
        }
    ]
    
    for scenario in scenarios:
        sections = scenario.get('sections')
        expected = scenario.get('expected')
        yield check_conflict, sections, expected
