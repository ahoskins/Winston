import os
import json
import argparse
import requests

from angular_flask.core import db
from angular_flask.models import *

from angular_flask.classtime import *

def create_db():
    db.create_all()

def drop_db():
    db.drop_all()

def main():
    parser = argparse.ArgumentParser(description='Manage this Flask application.')
    parser.add_argument('command', help='the name of the command you want to run')
    parser.add_argument('--seedterm', help='the semantic name for the term to fill the db with')
    args = parser.parse_args()

    if args.command == 'create_db':
        create_db()
        print "DB created!"

    elif args.command == 'delete_db':
        drop_db()
        print "DB deleted!"

    elif args.command == 'seed_db':
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
            if not cal.select_current_term_by_query(args.seedterm):
                raise Exception('Invalid term argument!')
            courses = cal.get_courses_for_current_term()
        else:
            cal.select_current_term_by_query('Fall Term 2014')
            courses = cal.get_courses_for_current_term()

        # Feed the course list into the database
        for course, i in zip(courses, range(len(courses))):
            if not i % 100:
                print "Course {}/{} added".format(i, len(courses))
            course_model = Course(course)
            if not Course.query.get(course_model.course):
                db.session.add(course_model)
        print "{}/{}".format(len(courses), len(courses))
        try:
            db.session.commit()
        except:
            print 'Courses failed to add to database'
        else:
            print "All courses successfully added"

    else:
        raise Exception('Invalid command')

if __name__ == '__main__':
    main()



