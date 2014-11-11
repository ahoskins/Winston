
from __future__ import absolute_import

import unittest

import manage

class Arguments(object): # pylint: disable=R0903
    def __init__(self, command, term, startfrom):
        self.command = command
        self.term = term
        self.startfrom = startfrom

class TestManageDatabase(unittest.TestCase): # pylint: disable=R0904
    @classmethod
    def setup_class(cls):
        manage.delete_db()

    @classmethod
    def teardown_class(cls):
        pass

    def test_seed_db(self): #pylint: disable=R0201
        args = Arguments('seed_db', '1490', None)
        manage.seed_db(args)
        assert_valid_terms()
        assert_valid_courses()

def assert_valid_terms():
    import angular_flask.models as models
    for term_model in models.Term.query.all():
        assert term_model.term is not None
        assert term_model.termTitle is not None
        assert term_model.courses is not None

def assert_valid_courses():
    import angular_flask.models as models
    for course_model in models.Course.query.all():
        assert course_model.term is not None
        assert course_model.course is not None
        assert course_model.asString is not None
        assert course_model.sections is not None
