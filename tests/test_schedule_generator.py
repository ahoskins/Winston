
from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

from classtime.scheduling import ScheduleGenerator
from classtime import cal

def check_generate_schedule(schedule_params):
    num_schedules = 10
    generator = ScheduleGenerator(cal, schedule_params)
    schedules = generator.generate_schedules(num_schedules)
    logging.debug(schedule_params.get('name', ''))
    logging.debug(schedules)

def test_generate_schedule():
    schedule_params_list = [
        {   
            'name': 'Random small schedule',
            'term': '1490',
            'courses': ['002896',
                        '001341']
        },
        {   
            'name': 'First Year Engineering',
            'term': '1490',
            'courses': ['001343',
                        '004093',
                        '004096',
                        '006768',
                        '009019']
        },
        {   
            'name': 'Ross Anderson\'s 3rd Year Fall Term 2014',
            'term': '1490',
            'courses': ['010344',
                        '105014',
                        '105006',
                        '105471',
                        '006708',
                        '010812']
        },
        {
            'name': 'Taylor Rault\'s 2nd Year Fall Term 2014',
            'term': '1490',
            'courses': ['006973', # MEC E 260
                        '006790', # MATH 209
                        '006974', # MEC E 265
                        '098325', # MEC E 230
                        '001607', # CIV E 270
                        '004104', # ENGG 299
                        ]
        },
        {   
            'name': 'First Year Engineering, busy at some times',
            'term': '1490',
            'courses': ['001343',
                        '004093',
                        '004096',
                        '006768',
                        '009019'],
            'busy-times': [
                {
                    'day': 'MWF',
                    'startTime': '07:00 AM',
                    'endTime': '09:50 AM'
                },
                {
                    'day': 'TR',
                    'startTime': '04:00 PM',
                    'endTime': '10:00 PM'
                }
            ]
        }
    ]
    for schedule_params in schedule_params_list:
        yield check_generate_schedule, schedule_params
