===========
Get started
===========

Get set up
~~~~~~~~~~

Get `pip <https://pip.readthedocs.org/en/latest/>`__, for backend dependencies ::

 $ sudo apt-get install pip

Get `bower <http://bower.io/>`__, for frontend dependencies ::

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
dependencies manually <stackoverflow.com/questions/4768446/python-cant-install-python-ldap>`__

virtualenv
''''''''''

A virtual environment is an isolated build environment best used on a
per-project basis. It is recommended to use one. A good option is
`virtualenv <http://virtualenv.readthedocs.org/en/latest/virtualenv.html>`__.