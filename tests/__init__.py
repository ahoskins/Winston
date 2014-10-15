from angular_flask import app
from angular_flask.core import db

from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.restless import APIManager

app.config.from_object('tests.settings')
test_client = app.test_client()
