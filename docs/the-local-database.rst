==================
The local database
==================

The local database is used as a cache for the remote database. Schedule
generation requests will fetch section data from the remote server, but
terms and courses must be manually seeded.

.. _`seed-db`:

seed\_db
~~~~~~~~

Seed the database with the specified term and all courses in it.

::

 $ python manage.py seed_db [--term TERM]

:TERM: :ref:`4-digit unique term identifier <4-digit-term-identifier>`
       , default='1490' (Fall Term 2014)

.. _`delete-db`:

delete\_db
~~~~~~~~~~

Delete the database completely. This is irreversible.

::

 $ python manage.py delete_db

.. _`refresh-db`:

refresh\_db
~~~~~~~~~~~

Delete and rebuild the database with the specified term and all courses
in it 

::

 $ python manage.py refresh_db [--term TERM]

:TERM: :ref:`4-digit unique term identifier <4-digit-term-identifier>`
       , default='1490' (Fall Term 2014)