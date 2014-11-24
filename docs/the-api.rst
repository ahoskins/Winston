=======
The API
=======

Responses are communicated in `JavaScript Object Notation (javascript) <http://javascript.org>`__. Each endpoint returns a list of ``objects``. A few useful book-keeping items are also included in each response.

.. code:: javascript

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
            { <response object N> }
        ],
        "page": <int>,
        "total_pages": <int>
    }

The exception is :ref:`api/courses/\<course> <api-courses>`, which returns a single object (not a list), and no book-keeping items.

It is possible for zero ``<response object>``\ s to be returned.

Pagination
~~~~~~~~~~

Each response includes:
 * ``page`` := page number returned
 * ``total_pages`` := total number of pages

To get the nth page, append ``?page=<n>`` to any endpoint::

 GET /api/courses-min?page=2

If you are using a search query, append the page number with ``&``::

 GET /api/courses-min?q=<search_query>&page=2

Search queries
~~~~~~~~~~~~~~

`Search queries <http://flask-restless.readthedocs.org/en/latest/searchformat.html#searchformat>`__ are used to restrict an endpoint's output. This is useful both for performance and semantic reasons.

Format is::

 /api/<endpoint>?q={"filters":[{"name":<attribute_name>,"op":<comparison>,"val":<attribute_value>},{ ... },...]}

Examples:

 * Get courses for a certain institution and a certain term::

	 GET /api/courses-min?q={"filters":[{"name":"institution","op":"equals","val":"ualberta"},{"name":"term","op":"equal","val":"1490"}]}

 * Get terms for a certain institution::

 	 GET /api/terms?q={"filters":[{"name":"institution","op":"equals","val":"ualberta"}]}

Available operators `listed here <http://flask-restless.readthedocs.org/en/latest/searchformat.html#operators>`__. As of this writing, they are::

    ==, eq, equals, equals_to
    !=, neq, does_not_equal, not_equal_to
    >, gt, <, lt
    >=, ge, gte, geq, <=, le, lte, leq
    in, not_in
    is_null, is_not_null
    like
    has
    any

.. _api-institutions

api/institutions
~~~~~~~~~~~~~~~~

Retrieve a list of available institutions. Each institution contains all available information.

Request
'''''''

::

 GET localhost:5000/api/institutions

Response
''''''''

.. code:: javascript

    {
        "objects": [
            {
                "institution": "ualberta",
                "name": "University of Alberta"
            },
            { <institution object 2> },
            ...
            { <institution object N> }
        ]
        ...
    }

:objects: list of <institution object>s

.. _institution-identifier
.. _api-institution-object:

<institution object>
-------------

:institution: variable length institution identifier
:name: semantic institution name

.. _api-terms:

api/terms
~~~~~~~~~

Retrieve a list of available terms. Each term contains all available information.

Request
'''''''

::

 GET localhost:5000/api/terms

Response
''''''''

.. code:: javascript

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

:objects: list of <term object>s

.. _api-term-object:
.. _4-digit-term-identifier:

<term object>
-------------

:endDate: YYYY-MM-DD
:startDate: YYYY-MM-DD
:term: 4-digit term identifier
:termTitle: semantic term name

.. _api-courses-min:

api/courses-min
~~~~~~~~~~~~~~~

Quickly retrieve a list of all available courses. Each course object contains only essential information.

Request
'''''''

::
 
 GET localhost:5000/api/courses-min

Response
''''''''

.. code:: javascript

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

:objects: list of <course-min object>s

.. _api-course-min-object:
.. _6-digit-course-identifier:

<course-min object>
-------------------

:asString: <subject> <level>
:course: 6-digit course identifier
:faculty: semantic faculty name
:subject: variable-length subject identifier
:subjectTitle: semantic subject name

.. _api-courses:

api/courses/<course>
~~~~~~~~~~~~~~~~~~~~

Retrieve detailed information about a single course.

Request
'''''''

::

 GET localhost:5000/api/courses/<course>

:course: :ref:`6-digit unique course identifier <6-digit-course-identifier>`

Response
''''''''

.. code:: javascript

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

:asString: <subject> <level>
:career: variable-length abbrevation of university program type (undergrad, grad, ..)
:catalog: catalog id
:course: :ref:`6-digit unique course identifier <6-digit-course-identifier>`
:courseDescription: often long description of the course
:courseTitle: semantic course name
:department: semantic department name
:departmentCode: variable-length department identifier
:faculty: semantic faculty name
:facultyCode: variable-length faculty identifier
:subject: variable-length subject identifier
:subjectTitle: semantic subject name
:term: :ref:`4-digit unique term identifier <4-digit-term-identifier>`
:units: integer weight of the course

.. _api-generate-schedules:

api/generate-schedules
~~~~~~~~~~~~~~~~~~~~~~

Request
'''''''

::
 
 GET localhost:5000/api/generate-schedules?q=<q>

::

 q = {
        "institution": institution,
        "term": term,
        "courses": [course, course2, .., courseN],
        "busy-times": [
            {
                "day": "[MTWRF]{1,5}"
                "startTime": "##:## [AP]M",
                "endTime": "##:## [AP]M"
            },
            { <busytime object_2> },
            ...
            { <busytime object_n> }
        ],
        "electives": [
            {
                "courses": [course, course2, .., courseN]
            },
            { <electives object_2> },
            ...
            { <electives object_n> }
        ],
        "preferences": {
            "start-early": <integer>,
            "no-marathons": <integer>,
            "day-classes": <integer>
        }

 }

See the method `TestAPI.test_generate_schedules` in `tests/angular_flask/test_api.py` for concrete examples.

:institution: :ref:`unique institution identifier <institution-identifier>`
:term: :ref:`4-digit unique term identifier <4-digit-term-identifier>`
:courses: list of :ref:`6-digit unique course identifier <6-digit-course-identifier>`
:busy-times: list of <busytime> objects
:electives: (optional) list of one-key dictionaries containing a 'courses' list
:preferences: (optional) specify the weight of each :ref:`preference <api-preference-identifier>`. There are sensible defaults.

.. _api-busytime-object:

<busytime object>
-----------------

:day: day(s) which are busy. Uses :ref:`day format <day-format>`
:startTime: time the user starts being busy. Uses :ref:`time format <time-format>`
:endTime: time the user is not busy anymore. Uses :ref:`time format <time-format>`

.. _api-preference-identifier:

Preferences
-----------

In `preferences`, each key's value is the preference's **weighting**.  
Positive, negative, and zero-valued weightings are described for each preference type.

Currently supported preferences:

- `no-marathons`
  - `weight > 0` -> avoid long stretches of classes in a row
  - `weight < 0` -> prefer long stretches of classes in a row
  - `weight = 0` -> no preference

- `day-classes`
  - `weight > 0` -> prefer daytime classes
  - `weight < 0` -> prefer night classes (5pm and on)
  - `weight = 0` -> no preference

- `start-early`
  - `weight > 0` -> prefer early starts
  - `weight < 0` -> prefer late starts
  - `weight = 0` -> no preference
  - Note: `start-early` can be used in tandem with `busy_times` to specify exactly *how* early you want. 
    - eg `start-early: 10, busy_times: everyday 8am-9am` gets early schedules starting at or after 9am

There are sensible defaults for each preference, and all preferences are optional.

Response
''''''''

.. code:: javascript

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

:objects: list of <schedule object>s

.. _api-schedule-object:

<schedule object>
-----------------
:sections: list of <section object>s

.. _5-digit-section-identifier
.. _api-section-object:

<section object>
---------------- 

:<course attributes>: all attributes from the parent :ref:`course <api-courses>` object

:class\_: 5-digit unique section identifier
:component: section type identifier, often 'LEC', 'LAB', 'SEM'
:day: day(s) the section is on. Uses :ref:`day format <day-format>`
:startTime: time the section begins. Uses :ref:`time format <time-format>`
:endTime: time the section ends. Uses :ref:`time format <time-format>`

:section: section identifier. usually a letter and a number
:campus: variable-length campus identifier
:capacity: number of seats
:instructorUid: instructor identifier
:location: semantic location name

.. _day-format:

Day format
----------

String containing one or more of the characters "MTWRF", with each
corresponding to a day from Monday through Friday.

| eg "MWF"
| eg "TR"

.. _time-format:

Time format
-----------      

"HH:MM XM"

:HH: 2-digit hour between 00 and 12
:MM: 2-digit minute between 00 and 59
:X: ``A`` or ``P``

| eg "08:00 AM"
| eg "09:50 PM"
