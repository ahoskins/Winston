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

All API responses are sent as JSON.  

Requests:  

GET localhost:5000/api/terms/
- Gets a (paginated) list of all terms
- To get the next page, specify /terms?page=#

GET localhost:5000/api/terms/1490/courses
- Gets a (paginated) list of all courses in the specified term
- To get the next page, specify /terms/1490/courses?page=#

### Contributing

Commit messages follow the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)
