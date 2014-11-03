classtime
=========

Build a university schedule that fits your life in less than 5 minutes.

Table of contents
-----------------

- [Get started](#get-started)
- [The local database](#the-local-database)
    - [seed_db](#seed_db)
    - [delete_db](#delete_db)
    - [refresh_db](#refresh_db)
- [API](#api)
    - [api/terms](#apiterms)
    - [api/courses-min](#apicourses-min)
    - [api/courses/\<course\>](#apicoursescourse)
    - [api/generate-schedules](#apigenerate-schedules)
- [Tests](#tests)
- [Profiling](#profiling)
- [Contributing](#contributing)

-------

Get started
-----------

Get pip  
> $ sudo apt-get install pip

Get bower
> $ npm install -g bower

Clone the repo  
> $ git clone https://github.com/rosshamish/classtime classtime  
> $ cd classtime

Install dependencies  
> $ sudo pip install -r requirements.txt
> $ bower install

Run the server  
> $ python runserver.py

View  
> [http://localhost:5000](http://localhost:5000)

Send a request to the [API](#api)  
> GET [http://localhost:5000/api/terms](http://localhost:5000/api/terms)

##### Troubleshooting

If the install fails, you might also need to [install python-ldap's dependencies manually](stackoverflow.com/questions/4768446/python-cant-install-python-ldap)

##### virtualenv

A virtual environment is an isolated build environment best used on a per-project basis. It is recommended to use one. A good option is [virtualenv](http://virtualenv.readthedocs.org/en/latest/virtualenv.html).

-----

The local database
------------------
[seed_db](#seed_db)
, [delete_db](#delete_db)
, [refresh_db](#refresh_db)

The local database is used as a cache for the remote database. Schedule generation requests will fetch section data from the remote server, but terms and courses must be manually seeded.

### seed_db

Seed the database with the specified term and all courses in it.

`$ python manage.py seed_db [--term TERM]`

> `TERM` := [4-digit unique term identifier](#apiterms) - default: `1490` (Fall Term 2014)

### delete_db

Delete the database completely. This is irreversible.

`$ python manage.py delete_db`

### refresh_db

Delete and rebuild the database with the specified term and all courses in it.

`$ python manage.py refresh_db [--term TERM]`

> `TERM` := [4-digit unique term identifier](#apiterms) - default: `1490` (Fall Term 2014)

-----

API
---

[api/terms](#apiterms)
, [api/courses-min](#apicourses-min)
, [api/courses/\<course\>](#apicoursescourse)
, [api/generate-schedules](#apigenerate-schedules)

Responses are communicated in [JavaScript Object Notation (JSON)](http://json.org). Each endpoint returns a list of `objects`. A few useful book-keeping items are also included in each response.
```json
{
    "num_results": <int>,
    "objects": [
        {
            <key>: <value>,
            <key>: <value>,
            ...
            <key>: <value>
        },
        { <response object 2> },
        ...
        { <response object num_results> }
    ],
    "page": <int>,
    "total_pages": <int>
}
```

The exception is [api/courses/\<course\>](#apicoursescourse), which returns only a single object (not a list), and no book-keeping items.

It is possible for zero `<response object>`s to be returned.

Pagination is supported through `page` and `total_pages`. To get the *n*th page, append `?page=<n>` to any endpoint
  - if you are using a [search query] already, use `?q=<search_query>&page=<n>`

Endpoints are documented individually.

### api/terms

Retrieve a list of available terms. Each term contains all available information.

##### Request
`GET localhost:5000/api/terms`

##### Response
```json
{
    "objects": [
        {
            "endDate": "2007-12-05",
            "startDate": "2007-09-05",
            "term": "1210",
            "termTitle": "Fall Term 2007"
        },
        { <term object 2> },
        ...
        { <term object N> }
    ],
    ...
}

```

`endDate` := YYYY-MM-DD  
`startDate` := YYYY-MM-DD  
`term` :=  4-digit unique identifier  
`termTitle` := semantic term name  

### api/courses-min

Quickly retrieve a list of all available courses. Each course object contains only essential information.

##### Request
`GET localhost:5000/api/courses-min`

##### Response
```json
{
    "objects" : [
        {
            "asString": "ACCTG 300",
            "course": "000001",
            "faculty": "Faculty of Business",
            "subject": "ACCTG",
            "subjectTitle": "Accounting"
        },
        { <course-min object 2> },
        ...
        { <course-min object N> }
    ],
    ...
}
```

`objects` := list of `<course-min object>`s

###### \<course-min object\>

`asString` := "\<subject\> \<level\>"  
`course` := 6-digit unique course identifier  
`faculty` := semantic faculty name  
`subject` := variable-length subject identifier  
`subjectTitle` := semantic subject name  

### api/courses/\<course\>

Retrieve detailed information about a single course.

##### Request
`GET localhost:5000/api/courses/<course>`  

`course` := [6-digit unique course identifier](#apicourses-min)

##### Response
```json
{
    "asString": "ACCTG 300",
    "career": "UGRD",
    "catalog": 300,
    "course": "000001",
    "courseDescription": "Provides a basic understanding of accounting: how accounting numbers 
        are generated, the meaning of accounting reports, and how to use accounting reports to 
        make decisions. Note: Not open to students registered in the Faculty of Business. Not 
        for credit in the Bachelor of Commerce Program.",
    "courseTitle": "Introduction to Accounting",
    "department": "Department of Accounting, Operations and Information Systems",
    "departmentCode": "AOIS",
    "faculty": "Faculty of Business",
    "facultyCode": "BC",
    "subject": "ACCTG",
    "subjectTitle": "Accounting",
    "term": "1490",
    "units": 3
}
```

`asString` := "\<subject\> \<level\>"  
`career` := variable-length abbrevation of university program type (undergrad, grad, ..)  
`catalog` := catalog id  
`course` := [6-digit unique course identifier](#apicourses-min)  
`courseDescription` := often long description of the course  
`courseTitle` := semantic course name  
`department` := semantic department name  
`departmentCode` := variable-length department identifier  
`faculty` := semantic faculty name  
`facultyCode` := variable-length faculty identifier  
`subject` := variable-length subject identifier  
`subjectTitle` := semantic subject name  
`term` := [4-digit unique term identifier](#apiterms)    
`units` := integer weight of the course  

### api/generate-schedules

##### Request
`GET localhost:5000/api/generate-schedules?q=<request-parameters>`

```json
request-parameters := {
                          "term": term,
                          "courses": [course, course2, .., courseN]
                      }
```

`term` := [4-digit unique term identifier](#apiterms)  
`courses` := list of [6-digit unique course identifier](#apicourses-min)s

##### Response
```json
{
    "objects": [
        {
            "sections" : [
                {
                    ...
                    <course attributes>
                    ...
                    "class_": "62293",
                    "component": "LEC",
                    "day": "MWF",
                    "startTime": "10:00 AM",
                    "endTime": "10:50 AM",
                    "similarSections": [
                        ...
                        { <section object> },
                        ...
                    ],
                    ...
                    "section": "A02",
                    "campus": "MAIN",
                    "capacity": 0,
                    "instructorUid": "jdavis",
                    "location": "CCIS L2 190"
                },
                { <section object 2> },
                ...
                { <section object N> }
            ]
        },
        { <schedule object 2> },
        ...
        { <schedule object M> }
    ],
    ...
}
```

`objects` := list of `<schedule object>`s

###### \<schedule object\>

`sections` := list of `<section object>`s

###### \<section object\>

`<course attributes>` := all attributes from the parent [course](#apicoursescourse) object  

`class_` := 5-digit unique section identifier  
`component` := section type identifier, often 'LEC', 'LAB', 'SEM'  
`day` := day(s) the section is on. uses [day format](#day-format)  
`startTime` := time the section begins. uses [time format](#time-format)  
`endTime` := time the section ends. uses [time format](#time-format)  
`similarSections` := list of [similar](#similarsections) `<section object>`s

`section` := section identifier. usually a letter and a number  
`campus` := variable-length campus identifier  
`capacity` := number of seats  
`instructorUid` := instructor identifier  
`location` := somewhat semantic location name  

###### Day format

String containing one or more of the characters `"MTWRF"`, with each corresponding to a day from Monday through Friday.

eg `"MWF"`  
eg `"TR"`

###### Time format

`"HH:MM XM"`

`HH` := 2-digit hour between 00 and 12  
`MM` := 2-digit minute between 00 and 59  
`X` := `A` or `P`

eg `"08:00 AM"`  
eg `"09:50 PM"`

###### Similar sections

Sections are similar if they have:
- equal `course`
- equal `component`
- equal `startTime`
- equal `endTime`

Importantly, they may have:
- varying `section`
- varying `campus`
- varying `capacity`
- varying `location`
- varying `instructorUid`

-------

Tests
-----

Core functionality is tested with [nosetests](https://nose.readthedocs.org/en/latest/).

Test suites are in the `tests/` directory. Test filenames are prefixed with `test_`. Test functions are prefixed with `test_`.

### Run tests

Run all tests  
> $ cd <project_root>  
> $ nosetests [options]

Run tests only in a specific file    
> $ nosetests [path/to/test/file] [options]

Useful options:
- `--nocapture --pdb`: drop into [pdb](https://docs.python.org/2/library/pdb.html) on error or exception
- `--nologcapture`: output all logging during test execution

### Write tests

Check out ["writing tests"](https://nose.readthedocs.org/en/latest/writing_tests.html) in the [nose documentation](https://nose.readthedocs.org/en/latest/).

-----

Profiling
---------

Performance bottlenecks are found by [profiling](http://en.wikipedia.org/wiki/Profiling_%28computer_programming%29) tests.

Profiling data is collected with [`nose-cprof`](https://github.com/msherry/nose-cprof) and analyzed with [`cprofilev`](http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html).

> [`nose-cprof`](https://github.com/msherry/nose-cprof) is a [nose plugin](http://nose.readthedocs.org/en/latest/plugins/builtin.html) which gives nose access to python's builtin profiler, [`cProfile`](https://docs.python.org/2/library/profile.html).

### Get started

Use pip to install the nose-cprof plugin  
> $ sudo pip install nose-cprof

Install [cprofilev](http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html)  
> $ sudo pip install cprofilev

### Workflow

Run the tests with the profiler attached.  
> $ nosetests [path/to/test/file] --with-cprof --cprofile-stats-file OUTPUT-FILE

> `OUTPUT-FILE` := filename to write profiling output to - default: `./stats.dat`

Start cprofilev  
> $ cprofilev stats.dat  

View and [analyze](http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html)  
> [http://localhost:5000](http://localhost:5000)

-----

Contributing
------------

Commit messages follow the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)
