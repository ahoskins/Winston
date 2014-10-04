import sys
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

def experiment():
    cal = CourseCalendar()

    term = 'Fall Term 2014'
    print 'Generating courselist for [{}]'.format(term)
    cal.pickTerm(term)
    print '{} courses available'.format(len(cal.all_courses))

    print 'Adding...'
    courselist = ['ece321', 'ece311', 'soc301',
                  'mate201', 'ece325', 'stat235']
    for course in courselist:
        success, msg = cal.addCourse(course)
        print msg

    cal._populateSections()

    print prettyDict(cal.my_courses[0])

def prettyDict(d, indent=0):
   for key, value in d.iteritems():
      print '\t' * indent + str(key)
      if isinstance(value, dict):
         prettyDict(value, indent+1)
      else:
         print '\t' * (indent+1) + str(value)

if __name__ == '__main__':
    # stableExample()
    experiment()
