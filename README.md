classtime
=========

Magic university schedule builder based on public class data.  

### How to Get Started

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

**View**
> http://localhost:5000/

### API

All API responses are JSON, and support pagination through the `page` and `total_pages` attributes.  
For paginated requests, append `?page=<n>` (or `?q=...&page=<n>` if you are using a search query) to get the `n`th page.  
- `GET localhost:5000/api/terms/`
  - gets a list of all available terms
  - the `term` attribute of each term is its ID number, which is used to filter courses with  
- `GET localhost:5000/api/courses-min`
  - **gets a list of all courses, retrieving only these attributes: `subject, subjectTitle, course, asString`**
  - get only courses in a given term by appending `?q={"filters":[{"name":"term","op":"equals","val":<termnum>}]}` to the request
    - `termnum` is the `term` attribute found from a /api/terms call
      - eg for Fall Term 2014, `termnum` is 1490
    - more information on [search queries can be found here](http://flask-restless.readthedocs.org/en/latest/searchformat.html#quick-examples)  
- ~~GET localhost:5000/api/terms/1490/courses~~ (DEPRECATED)

### Tests

In the project root, run:  
> $ nosetests (to run all tests,)  
> $ nosetests -v (to run all tests with verbose output, and)  
> $ nosetests \<path/to/file\> (to only run tests in a certain file)

### Contributing

Commit messages follow the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)
