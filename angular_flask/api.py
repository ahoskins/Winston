from angular_flask.core import api_manager
from angular_flask.models import *

# --------------------------------
# API Routing
# --------------------------------

def post_terms_remove_courses(result=None, search_params=None, **kw):
    """Accepts two arguments, `result`, which is the dictionary
    representation of the JSON response which will be returned to the
    client, and `search_params`, which is a dictionary containing the
    search parameters for the request (that produced the specified
    `result`).
    """
    if 'objects' in result:
        for term in result['objects']:
            term.pop('courses', None)

def post_term_remove_course_sections(result=None, **kw):
    if 'objects' in result:
        term = result['objects']
        for course in term:
            course.pop('sections', None)

# accessible at http://localhost:5000/api/terms
api_manager.create_api(Term,
                       methods=['GET'],
                       postprocessors={'GET_MANY': [post_terms_remove_courses],
                                       'GET_SINGLE': [post_term_remove_course_sections]},
                       collection_name='terms')

# accessible at http://localhost:5000/api/courses
api_manager.create_api(Course,
                       methods=['POST'],
                       collection_name='courses')
