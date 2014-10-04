classtime
=========

Magic university schedule builder based on public class data.  

## dependencies
python-ldap  	
`sudo apt-get install python-ldap`

### How to Get Started

1. install all the necessary packages (best done inside of a virtual environment)
> pip install -r requirements.txt

2. run the app
> python runserver.py

3. create and seed the db (the server must still be running, so open a new terminal window first)
> python manage.py create_db && python manage.py seed_db --seedfile 'data/db_items.json'

4. view
> http://localhost:5000/
