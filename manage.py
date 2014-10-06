import os
import json
import argparse
import requests

from angular_flask.core import db
from angular_flask.models import *

def create_db():
    db.create_all()

def drop_db():
    db.drop_all()

def main():
    parser = argparse.ArgumentParser(description='Manage this Flask application.')
    parser.add_argument('command', help='the name of the command you want to run')
    parser.add_argument('--seedfile', help='the file with data for seeding the database')
    args = parser.parse_args()

    if args.command == 'create_db':
        create_db()

        print "DB created!"
    elif args.command == 'delete_db':
        drop_db()

        print "DB deleted!"
    elif args.command == 'seed_db' and args.seedfile:
        with open(args.seedfile, 'r') as f:
            seed_data = json.loads(f.read())
        
        for item_class in seed_data:
            items = seed_data[item_class]
            for item in items:
                # print item
                db.session.add(Course(item))
            db.session.commit()

        print "\nSample data added to database!"
    else:
        raise Exception('Invalid command')

if __name__ == '__main__':
    main()



