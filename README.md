classtime
=========

Magic university schedule builder based on public class data.  

## How to Get Started

**Install all the necessary packages** (best done inside of a [virtual environment](http://virtualenv.readthedocs.org/en/latest/virtualenv.html))  
> $ sudo pip install -r requirements.txt

If this fails, you might also need to [install python-ldap's dependencies manually](stackoverflow.com/questions/4768446/python-cant-install-python-ldap).  
On ubuntu, do:  
> $ sudo apt-get install python-dev libldap2-dev libsasl2-dev libssl-dev
> $ sudo pip install python-ldap

**Run the app**
> $ python runserver.py

**Create and seed the db**  
Note: the server must be running, so do this in a second terminal
> $ python manage.py create_db  
> $ python manage.py seed_db [--seedterm 1490]  
> > Note: for debugging or cleanup purposes, the database can be deleted with  
> > $ python manage.py delete_db

**View**
> http://localhost:5000/

## API

All API responses are valid [JSON](http://json.org/), and support pagination through the `page` and `total_pages` attributes.  
For paginated requests, append `?page=<n>` (or `?q=...&page=<n>` if you are using a search query) to get the `n`th page.

### api/terms
`GET localhost:5000/api/terms/`  
Gets a list of all available terms.  
The `term` attribute of each term is its ID number, which is used to with /courses-min/ to only retrieve courses in a certain term.

### api/courses-min
`GET localhost:5000/api/courses-min`  
Gets a list of courses, retrieving only a few attributes: `subject, subjectTitle, course, asString`  
These attributes are exactly specified in [api.py](angular_flask/api.py)  
*Where:* In the `api_manager.create_api` call with `collection_name='courses-min'`, the `include_columns` list  
Can restrict the request to a specific term using a [search query](http://flask-restless.readthedocs.org/en/latest/searchformat.html#quick-examples)  
*Example:* `GET localhost:5000/api/courses-min?q={"filters":[{"name":"term","op":"equals","val":1490}]}`  
Returns a list of courses in term 1490 (filters: term equals 1490)

### api/courses/\<course\>
`GET localhost:5000/api/courses/<course>`  
Gets all available details regarding a certain course.  
Where `<course>` is the value of a course's `course` attribute (which can be found from /api/courses-min)  
*Example:* `GET localhost:5000/api/courses/1`  
Returns all attributes for course 1

### Deprecated api endpoints
~~`GET localhost:5000/api/terms/1490/courses`~~  

-----

## Tests

In the project root, run:  
> $ nosetests (to run all tests,)  
> $ nosetests -v (to run all tests with verbose output, and)  
> $ nosetests \<path/to/file\> (to only run tests in a certain file)

## Contributing

Commit messages follow the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)
