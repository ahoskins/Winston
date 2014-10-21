import sys
import argparse

from angular_flask.logging import logging

from angular_flask.core import db
from angular_flask.models import Term, Course, Section

from angular_flask.classtime import cal

def create_db():
    db.create_all()
    print 'DB created!'

def delete_db():
    db.drop_all()
    print 'DB deleted!'

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
        logging.warning('Terms failed to add to database')
    else:
        logging.info('All terms successfully added')

    # Get the course list
    if args.term:
        cal.select_current_term(args.term)
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
        logging.debug('course.term: {}'.format(course.get('term')))
        course_model = Course(course)
        if not Course.query.get(course_model.course):
            db.session.add(course_model)
    try:
        db.session.commit()
    except:
        logging.warning('Courses failed to add to database')
    else:
        logging.info('DB seeded!')

def refresh_db(args, db):
    delete_db()
    create_db()
    seed_db(args, db)

def main():
    parser = argparse.ArgumentParser(description='Manage the academic database')
    parser.add_argument('command', help='create_db, fill_courses, fill_sections, delete_db, refresh_db')
    parser.add_argument('--term', help='the id of the term to fill the db with (eg 1490)')
    parser.add_argument('--startfrom', help='the course id to begin filling at')
    args = parser.parse_args()

    if args.command == 'create_db':
        create_db()
    elif args.command == 'delete_db':
        delete_db()
    elif args.command == 'seed_db' or args.command == 'fill_courses':
        seed_db(args, db)
    elif args.command == 'refresh_db':
        refresh_db(args, db)
    else:
        parser.print_usage()
        raise Exception('Invalid command')

if __name__ == '__main__':
    main()



