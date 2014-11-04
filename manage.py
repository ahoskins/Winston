
import argparse

from angular_flask.logging import logging

from angular_flask.core import db
from angular_flask.classtime import cal

def create_db():
    db.create_all()
    logging.info('DB created!')

def delete_db():
    db.drop_all()
    logging.info('DB deleted!')

def seed_db(args):
    create_db()
    term = 1490
    if args.term:
        term = args.term
    cal.select_current_term(term)
    logging.info('DB seeded with term {}'.format(term))

def refresh_db(args):
    delete_db()
    seed_db(args)

def main():
    parser = argparse.ArgumentParser(description='Manage the academic database')
    parser.add_argument('command', help='seed_db, refresh_db, create_db, delete_db')
    parser.add_argument('--term', help='the id of the term to fill the db with (eg 1490)')
    parser.add_argument('--startfrom', help='the course id to begin filling at')
    args = parser.parse_args()

    if args.command == 'delete_db':
        delete_db()
    elif args.command == 'seed_db':
        seed_db(args)
    elif args.command == 'refresh_db':
        refresh_db(args)
    else:
        parser.print_usage()
        raise Exception('Invalid command')

if __name__ == '__main__':
    main()



