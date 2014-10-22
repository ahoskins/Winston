
from angular_flask.classtime.schedule_generator import ScheduleGenerator
from angular_flask.classtime import cal

def test_generate_schedule():
    term = 1490
    course_list = [2896, 1341]
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.get_schedules()
    # assert schedules is None

    term = 1490
    course_list = [1343, 4093, 4096, 6768, 9019]
    generator = ScheduleGenerator(cal, term, course_list)
    schedules = generator.get_schedules()
    import pdb; pdb.set_trace()
