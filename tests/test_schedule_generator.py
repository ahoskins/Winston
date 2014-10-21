
from angular_flask.classtime.schedule_generator import ScheduleGenerator

def test_generate_schedule():
    course_list = [
        {
            'course': 1,
            'sections': [
                {
                    'component': 'LEC',
                    'day': 'TR',
                    'startTime': '08:00 AM',
                    'endTime': '09:20 AM'
                },
                {
                    'component': 'LAB',
                    'day': 'MWF',
                    'startTime': '08:00 AM',
                    'endTime': '08:50 AM'
                },
                {
                    'component:': 'LAB',
                    'day': 'MWF',
                    'startTime': '09:00 AM',
                    'endTime': '09:50 AM'
                }
            ]
        },
        {
            'course': 2,
            'sections': [
                {
                    'component': 'LEC',
                    'day': 'TR',
                    'startTime': '08:00 AM',
                    'endTime': '09:20 AM'
                },
                {
                    'component': 'LEC',
                    'day': 'MWF',
                    'startTime': '09:00 AM',
                    'endTime': '09:50 AM'
                }
            ]
        }
    ]
    sg = ScheduleGenerator(course_list)
    sg.get_schedules()
