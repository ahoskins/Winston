import os

from flask import Flask, request, Response
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort

from angular_flask import app

# Initializes the Flask-Restless API
import angular_flask.api

# flask-sqlalchemy database
from angular_flask.core import db

# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/index')
def basic_pages(**kwargs):
    return make_response(open('angular_flask/static/views/index.html').read())

# special file handlers and error handlers
# @app.route('/favicon.ico')
# def favicon():
#     return send_from_directory(os.path.join(app.root_path, 'static'),
#                                'img/favicon.ico')

@app.errorhandler(404)
def page_not_found(e):
    return make_response(open('angular_flask/templates/404.html').read()), 404
