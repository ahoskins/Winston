
from angular_flask.logging import logging

from angular_flask.classtime.schedule_generator import ScheduleGenerator
from angular_flask.classtime import cal

def test_generate_schedule():
    # Random small schedule
    term = '1490'
    course_list = ['002896', '001341']
    num_schedules = 10
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.generate_schedules(num_schedules)
    logging.debug('Schedules:\n{}'.format(schedules))

    # First Year Engineering
    term = '1490'
    course_list = ['001343', '004093', '004096', '006768', '009019']
    num_schedules = 10
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.generate_schedules(num_schedules)
    logging.debug('Schedules:\n{}'.format(schedules))

    # Ross Anderson's 3rd Year Fall Term 2014 Course List
    term = '1490'
    course_list = ['010344', '105014', '105006', '105471', '006708', '010812']
    num_schedules = 10
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.generate_schedules(num_schedules)
    logging.debug('Schedules:\n{}'.format(schedules))
