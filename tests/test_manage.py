
from tests import db

from angular_flask.models import Term, Course

def test_manage_seed_db():
    from manage import seed_db
    class Arguments: pass
    args = Arguments()
    args.seedterm = None
    db.create_all()
    seed_db(args, db)

    def check_term(term_model):
        assert term_model.term is not None
        assert term_model.termTitle is not None
        assert term_model.courses is not None

    for term_model in Term.query.all():
        yield check_term, term_model

    def check_course(course_model):
        assert course_model.term is not None
        assert course_model.course is not None
        assert course_model.asString is not None
        assert course_model.sections is not None

    for course_model in Course.query.all():
        yield check_course, course_model
