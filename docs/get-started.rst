===========
Get started
===========

Purpose
~~~~~~~

The purpose of this web app is to give students at the University of Alberta more flexibility, more options, and more freedom in choosing their timetable each semester.

- Students are able to
    * browse available courses
    * find out more about each course
    * block off times in the week for sleeping, for work, for seeing friends, etc
    * pick courses
    * browse matching timetables
- The site
    * has a simple interface with a small number of core features
    * loads quickly, behaves smoothly
    * keeps the user in the loop during loading, connection, creation, etc

Get set up
~~~~~~~~~~

Get `pip <https://pip.readthedocs.org/en/latest/>`__, for backend dependencies ::

 $ sudo apt-get install pip

Get `bower <http://bower.io/>`__, for frontend dependencies. You will need `node and npm <http://nodejs.org/download/>`__ first. ::

 $ npm install -g bower

Clone the source ::

 $ git clone https://github.com/rosshamish/classtime classtime
 $ cd classtime

Install dependencies ::

 $ sudo pip install -r requirements.txt
 $ bower install

Check it out
~~~~~~~~~~~~

Run the server ::

 $ python runserver.py

View ::

 http://localhost:5000

Send a request to the API ::

 GET http://localhost:5000/api/terms

Troubleshooting
~~~~~~~~~~~~~~~

If the install fails, you might also need to `install python-ldap's
dependencies manually <http://stackoverflow.com/questions/4768446/python-cant-install-python-ldap>`__

virtualenv
~~~~~~~~~~

A virtual environment is an isolated build environment best used on a
per-project basis. It is recommended to use one. A good option is
`virtualenv <http://virtualenv.readthedocs.org/en/latest/virtualenv.html>`__.

Usage ::

	$ virtualenv venv # create a virtual environment in the folder 'venv'
	$ . venv/bin/activate  # activate the virtual environment
	(venv)$ pip install -r requirements.txt # install dependencies to the virtual environment