classtime
=========

Magic university schedule builder based on public class data.  

### How to Get Started

1. Install all the necessary packages (best done inside of a virtual environment)  
> $ pip install -r requirements.txt

If this doesn't work, you might also need to install python-ldap's dependencies manually [(check this StackOverflow answer)](stackoverflow.com/questions/4768446/python-cant-install-python-ldap). On ubuntu, do:  
> $ sudo apt-get install python-dev libldap2-dev libsasl2-dev libssl-dev
> $ sudo pip install python-ldap

2. run the app
> python runserver.py

3. Create and seed the db (the server must still be running, so open a new terminal window first)
> python manage.py create_db  
> python manage.py seed_db [--seedterm "Winter Term 2015"]

4. View
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

Commit message standards are as written in the [Angular.js commit message style guide](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1#)