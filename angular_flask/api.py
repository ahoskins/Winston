
import os
import json
from collections import defaultdict

from angular_flask.logging import logging

from angular_flask.core import api_manager, db
from angular_flask.models import Institution, Term, Course, Section

import classtime.institutions
import classtime.scheduling as scheduling

def fill_institutions(search_params=None): #pylint: disable=W0613
    db.create_all()
    if Institution.query.first() is None:
        config_file = os.path.join(classtime.institutions.CONFIG_FOLDER_PATH,
            'institutions.json')
        with open(config_file, 'r') as config:
            config = json.loads(config.read())
        institutions = config.get('institutions')
        for institution in institutions:
            if not Institution.query.get(institution.get('institution')):
                db.session.add(Institution(institution))
        try:
            db.session.commit()
        except:
            logging.error('Institutions failed to add to database')
            return None

api_manager.create_api(Institution,
                       collection_name='institutions',
                       methods=['GET'],
                       preprocessors={
                           'GET_MANY': [fill_institutions]
                       })

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

def courses_min_structured(result=None, search_params=None):
    def new_list_and_set():
        return list(defaultdict(list)), set()
    if result is None:
        return
    obj_courses = result['objects']
    faculty_list, faculty_set = new_list_and_set()
    subject_list, subject_set = new_list_and_set()
    for course in obj_courses:
        if course.get('faculty') not in faculty_set:
            faculty_set.add(course.get('faculty'))
            faculty_list.append({
                'faculty': course.get('faculty'),
                'subjects': list()
            })
            subject_list, subject_set = new_list_and_set()

        if course.get('subject') not in subject_set:
            subject_set.add(course.get('subject'))
            subject_list.append({
                'subject': course.get('subject'),
                'subjectTitle': course.get('subjectTitle'),
                'courses': list()
            })
            faculty_list[-1]['subjects'] = subject_list

        subject_list[-1]['courses'].append({
            'course': course.get('course'),
            'asString': course.get('asString')
        })
    result['objects'] = faculty_list
    return



api_manager.create_api(Course,
                       collection_name='courses-min-structured',
                       methods=['GET'],
                       include_columns=['asString',
                                        'faculty',
                                        'subject',
                                        'subjectTitle',
                                        'course'],
                       postprocessors={
                           'GET_MANY': [courses_min_structured]
                       },
                       results_per_page=COURSES_PER_PAGE,
                       max_results_per_page=COURSES_PER_PAGE)

  
# --------------------------------
# Schedule Generation
# --------------------------------

NUM_SCHEDULES = 10
def find_schedules(result=None, search_params=None):
    if result is None:
        result = dict()
    result['page'] = 1
    result['total_pages'] = 1

    schedules = scheduling.find_schedules(search_params, NUM_SCHEDULES)
    result['num_results'] = len(schedules)
    result['objects'] = list()
    for schedule in schedules:
        result['objects'].append({
            'sections': schedule.sections
        })
    return

api_manager.create_api(Section,
                       collection_name='generate-schedules',
                       include_columns=[],
                       methods=['GET'],
                       postprocessors={
                           'GET_MANY': [find_schedules]
                       })
