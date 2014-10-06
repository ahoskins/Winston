import sys
import json
import argparse
from CourseCalendar import CourseCalendar

# Reference all parts of this tutorial!
#
# https://www.packtpub.com/books/content/python-ldap-applications-part-1-installing-and-configuring-python-ldap-library-and-bin

def stableExample():
    cal = CourseCalendar()
    
    prompt = 'Select term: '
    term = raw_input(prompt)
    valid = cal.pickTerm(term)
    while not valid:
        term = raw_input(prompt)
        valid = cal.pickTerm(term)
    print '{} courses are available'.format(len(cal.all_courses))

    print 'Course search (example queries: ECE 240, mate201, eng)'
    prompt = 'Search (blank to add courses): '
    query = raw_input(prompt)
    while len(query):
        courses = cal.findCoursesBySubject(query)
        for course in courses:
            print course['asString']
        query = raw_input(prompt)

    print 'Add a course (same search rules)'
    prompt = 'Add (blank to quit): '
    query = raw_input(prompt)
    while len(query):
        success, msg = cal.addCourse(query)
        if success:
            print '{} added successfully'.format(msg)
        else:
            print msg
        query = raw_input(prompt)

def create_db_items_json(destfile, limit):
    print 'Connecting to calendar...'
    cal = CourseCalendar()
    print '..done'
    term = 'Fall Term 2014'
    print 'Finding all courses in [{}]...'.format(term)
    cal.pickTerm(term)
    print '...done'

    print 'Creating local JSON file of all courses in Fall Term 2014...'
    jsoncourses = dict()
    jsoncourses['course'] = cal.all_courses
    f = open(destfile, 'w')
    f.write(json.dumps(jsoncourses))
    f.close()
    print '...done'

# def experiment():
#     cal = CourseCalendar()

#     term = 'Fall Term 2014'
#     print 'Generating courselist for [{}]'.format(term)
#     cal.pickTerm(term)
#     print '{} courses available'.format(len(cal.all_courses))

#     print 'Adding...'
#     courselist = ['ece321', 'ece311', 'soc301',
#                   'mate201', 'ece325', 'stat235']
#     for course in courselist:
#         success, msg = cal.addCourse(course)
#         print msg

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run various functions on the classtime backend')
    parser.add_argument('command', help='the name of the command you want to run')
    parser.add_argument('--dest', help='the destination file to write the json data to')
    parser.add_argument('--limit', help='the max number of courses to fetch. 0 => no limit')
    args = parser.parse_args()

    if args.command == 'create_json' and args.dest and args.limit:
        try:
            f = open(args.dest)
        except:
            raise Exception('File does not exist')
        finally:
            f.close()
        create_db_items_json(args.dest, args.limit)
    else:
        raise Exception('Invalid command')    
