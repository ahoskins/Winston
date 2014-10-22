
from angular_flask.classtime.schedule_generator import ScheduleGenerator
from angular_flask.classtime import cal

def test_generate_schedule():
    term = '1490'
    course_list = ['002896', '001341']
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.get_schedules()
    # assert schedules is None

    term = '1490'
    course_list = ['001343', '004093', '004096', '006768', '009019']
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.get_schedules()
