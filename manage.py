import sys
import argparse

from angular_flask.core import db
from angular_flask.models import Term, Course

from angular_flask.classtime import cal

def seed_db(args, db):
    # Get the term list
    terms = cal.get_term_list()
    # Feed the term list into the database
    for term in terms:
        term_model = Term(term)
        if not Term.query.get(term_model.term):
            db.session.add(term_model)
    try:
        db.session.commit()
    except:
        print 'Terms failed to add to database'
    else:
        print 'All terms successfully added'

    # Get the course list
    if args.seedterm:
        cal.select_current_term(args.seedterm)
        courses = cal.get_courses_for_current_term()
    else:
        cal.select_current_term('1490')
        courses = cal.get_courses_for_current_term()

    # Feed the course list into the database
    sys.stdout.write('Course 0/{}'.format(len(courses)))
    sys.stdout.flush()
    for course, i in zip(courses, range(len(courses))):
        if not i % 100:
            sys.stdout.write('\rCourse {}/{} added'.format(i, len(courses)))
            sys.stdout.flush()
        course_model = Course(course)
        if not Course.query.get(course_model.course):
            db.session.add(course_model)
    try:
        db.session.commit()
    except:
        print '\nCourses failed to add to database'

def main():
    parser = argparse.ArgumentParser(description='Manage this Flask application.')
    parser.add_argument('command', help='the name of the command you want to run')
    parser.add_argument('--seedterm', help='the id of the ualberta term to fill the db with (eg 1490)')
    args = parser.parse_args()

    if args.command == 'create_db':
        db.create_all()
        print 'DB created!'

    elif args.command == 'delete_db':
        db.drop_all()
        print 'DB deleted!'

    elif args.command == 'seed_db':
        seed_db(args, db)
        print 'DB seeded!'

    else:
        raise Exception('Invalid command')

if __name__ == '__main__':
    main()



