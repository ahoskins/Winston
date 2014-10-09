classtime
=========

Magic university schedule builder based on public class data.  

## Dependencies  

python-ldap  	
`sudo apt-get install python-ldap`

### How to Get Started

1. install all the necessary packages (best done inside of a virtual environment)
> pip install -r requirements.txt

2. run the app
> python runserver.py

3. create and seed the db (the server must still be running, so open a new terminal window first)
> python manage.py create_db  
> python manage.py seed_db [--seedterm "Winter Term 2015"]

4. view
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

