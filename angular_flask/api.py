
from angular_flask.core import api_manager
from angular_flask.models import Term, Course

# --------------------------------
# API Routing
# --------------------------------

# accessible at http://localhost:5000/api/terms
api_manager.create_api(Term,
                       methods=['GET'],
                       exclude_columns=['courses', 'courses.sections'],
                       collection_name='terms')

# accessible at http://localhost:5000/api/courses
api_manager.create_api(Course,
                       methods=['GET'],
                       exclude_columns=['sections'],
                       collection_name='courses')

COURSES_PER_PAGE = 500
api_manager.create_api(Course,
                       methods=['GET'],
                       include_columns=['asString',
                                        'faculty',
                                        'subject',
                                        'subjectTitle',
                                        'course'],
                       results_per_page=COURSES_PER_PAGE,
                       max_results_per_page=COURSES_PER_PAGE,
                       collection_name='courses-min')
