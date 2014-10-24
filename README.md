classtime
=========

Magic university schedule builder based on public class data.  

## Get Started

**Install all the necessary packages** (best done inside of a [virtual environment](http://virtualenv.readthedocs.org/en/latest/virtualenv.html))  
> $ sudo pip install -r requirements.txt

If this fails, you might also need to [install python-ldap's dependencies manually](stackoverflow.com/questions/4768446/python-cant-install-python-ldap)

**Run the app**
> $ python runserver.py

**Seed the db**  
The server must be running, so do this in a second terminal
> $ python manage.py seed_db

**View**
> http://localhost:5000/

## Seeding and managing the database

All database management is done using `$ python manage.py <command>`

#### $ python manage.py seed_db [--term TERM]
Seeds the database with the specified term and all courses in it. 
TERM is a 4-digit term id.  
If no TERM is specified, defaults to 1490 (Fall Term 2014).

#### $ python manage.py delete_db
Deletes the database completely

#### $ python manage.py refresh_db [--term TERM]
Delets then seeds the database.  
Is an alias for `$ python manage.py delete_db && python manage.py seed_db [--term TERM]`

## API

All API responses are valid [JSON](http://json.org/), and support pagination through the `page` and `total_pages` attributes.  
For paginated requests, append `?page=<n>` (or `?q=...&page=<n>` if you are using a search query) to get the `n`th page.

#### api/terms
`GET localhost:5000/api/terms/`  
Gets a list of all available terms.  
The `term` attribute of each term is its ID number, which is used to with /courses-min/ to only retrieve courses in a certain term.

#### api/courses-min
`GET localhost:5000/api/courses-min`  
Gets a list of courses, retrieving a limited number of attributes:  
```
asString
faculty
subject
subjectTitle
course
```
These attributes are exactly specified in [api.py](angular_flask/api.py)  
*Where:* In the `api_manager.create_api` call with `collection_name='courses-min'`, the `include_columns` list  
Can restrict the request to a specific term using a [search query](http://flask-restless.readthedocs.org/en/latest/searchformat.html#quick-examples)  
*Example (all courses in term 1490):*  
`GET localhost:5000/api/courses-min?q={"filters":[{"name":"term","op":"equals","val":1490}]}`  

#### api/courses/\<course\>
`GET localhost:5000/api/courses/<course>`  
Gets all available details regarding a certain course.  
Where `<course>` is the value of a course's `course` attribute (which can be found from /api/courses-min)  
*Example:* `GET localhost:5000/api/courses/1`  
Returns all attributes for course 1

#### Deprecated api endpoints
~~`GET localhost:5000/api/terms/1490/courses`~~  

-----

## Tests

[nosetests](https://nose.readthedocs.org/en/latest/) is used.  

In the project root, run  
> $ nosetests [options]

Or, to run tests only in a specific file, run  
> $ nosetests [path/to/test_file] [options]

Useful options:
- `--nocapture --pdb`: drop into [pdb](https://docs.python.org/2/library/pdb.html) on error or exception
- `--nologcapture`: output all logging during test execution

## Contributing

Commit messages follow the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)
