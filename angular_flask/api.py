
from angular_flask.logging import logging

from angular_flask.core import api_manager
from angular_flask.models import Term, Course, Section

from angular_flask.classtime import ScheduleGenerator
from angular_flask.classtime import cal

# --------------------------------
# General API calls
# -> collection_name specifies the path used to access the API
# -> eg, collection_name='terms' specifies that it can be called
#        at /api/terms/
# --------------------------------

api_manager.create_api(Term,
                       collection_name='terms',
                       methods=['GET'],
                       exclude_columns=['courses', 'courses.sections'])

api_manager.create_api(Course,
                       collection_name='courses',
                       methods=['GET'],
                       exclude_columns=['sections'])

COURSES_PER_PAGE = 500
api_manager.create_api(Course,
                       collection_name='courses-min',
                       methods=['GET'],
                       include_columns=['asString',
                                        'faculty',
                                        'subject',
                                        'subjectTitle',
                                        'course'],
                       results_per_page=COURSES_PER_PAGE,
                       max_results_per_page=COURSES_PER_PAGE)

# --------------------------------
# Schedule Generation
# --------------------------------

def generate_schedules(result=None, search_params=None, **kw):
    """
    Expects a search query where 'q' is dictionary of the form:
    {
        "term" : term_id,
        "courses" : [course_id_1, course_id_2, .., course_id_n]
    }
    eg:
    /api/generate-schedules?q={"term":"1490","courses":["001343", "009019"]}
    """
    if result is None:
        result = dict()
    courses = search_params.get('courses')
    term = search_params.get('term')
    if courses is None or term is None:
        culprit = ''
        if courses is None:
            culprit = 'courses'
        if term is None:
            culprit = 'term'
        errormsg = "field '{}' not present in /api/generate-schedules search query".format(culprit)
        logging.warning(errormsg)
        result['num_results'] = 1
        result['objects'] = [{"error": errormsg}]
        result['page'] = 1
        result['total_pages'] = 1
        return

    generator = ScheduleGenerator(cal, term, courses)
    schedules = generator.get_schedules(10)
    result['num_results'] = len(schedules)
    result['objects'] = [schedule.sections for schedule in schedules]
    result['page'] = 1
    result['total_pages'] = 1
    return


api_manager.create_api(Section,
                       collection_name='generate-schedules',
                       include_columns=[],
                       methods=['GET'],
                       postprocessors={
                           'GET_MANY': [generate_schedules]
                       })
