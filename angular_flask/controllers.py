import os

from flask import Flask, request, Response
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort

from angular_flask import app

# routing for API endpoints (generated from the models designated as API_MODELS)
from angular_flask.core import api_manager
from angular_flask.models import *

# flask-sqlalchemy database
from angular_flask.core import db

# LDAP server calendar data
from classtime_backend.CourseCalendar import CourseCalendar
cal = CourseCalendar()

# --------------------------------
# API Routing
# --------------------------------

def pre_terms_populate(search_params=None, **kw):
    """Accepts a single argument, `search_params`, which is a dictionary
    containing the search parameters for the request.
    "In other words, GET /api/person is roughly equivalent to GET /api/person?q={}"
    """
    if not search_params and not Term.query.all():
        print 'Populating terms from database'
        cal._populateTerms()
        for term in cal.all_terms:
            db.session.add(Term(term=term['term'],
                        termTitle=term['termTitle'],
                        startDate=term['startDate'],
                        endDate=term['endDate']))
        db.session.commit()
    else:
        print 'Not populating. "Term" table is already populated'

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
                       preprocessors={'GET_MANY': [pre_terms_populate]},
                       postprocessors={'GET_MANY': [post_terms_remove_courses],
                                       'GET_SINGLE': [post_term_remove_course_sections]},
                       collection_name='terms')

def pre_courses_populate(search_params=None, **kw):
    print 'at courses pre populate'
    try:
        cal
    except NameError:
        print 'cal not defined'
    else:
        if cal.term is not None:
            cal.pickTerm(cal.term)

# accessible at http://localhost:5000/api/courses
api_manager.create_api(Course,
                       methods=['POST'],
                       collection_name='courses')

session = api_manager.session

# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/index')
def basic_pages(**kwargs):
    return make_response(open('angular_flask/templates/index.html').read())

# routing for CRUD-style endpoints
# passes routing onto the angular frontend if the requested resource exists
from sqlalchemy.sql import exists

crud_url_models = app.config['CRUD_URL_MODELS']

@app.route('/<model_name>/')
@app.route('/<model_name>/<item_id>')
def rest_pages(model_name, item_id=None):
    if model_name in crud_url_models:
        print model_name
        print item_id
        model_class = crud_url_models[model_name]
        if item_id is None or session.query(exists().where(
            model_class.id == item_id)).scalar():
            print model_class
            print model_class.query.all()
            return make_response(open(
                'angular_flask/templates/index.html').read())
    abort(404)

# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
