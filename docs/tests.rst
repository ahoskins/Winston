=====
Tests
=====

Core functionality is tested with
`Nose <https://nose.readthedocs.org/en/latest/>`__

Nose is included in `requirements.txt <https://pip.readthedocs.org/en/1.1/requirements.html>`__, so if you ran ``$ pip install -r requirements.txt``, it is already installed.

Otherwise::

	install: $ pip install nose

Test suites are in ``tests/``. Test filenames are prefixed
with ``test_``. Test functions are prefixed with ``test_``

Run tests
~~~~~~~~~

Run all tests ::

 $ cd
 $ nosetests [options]

Run tests only in a specific file ::

 $ nosetests [path/to/test/file] [options]

Useful options:

--nocapture
	don't capture stdout. Necessary for --pdb
--pdb
	drop into `pdb <https://docs.python.org/2/library/pdb.html>`__ on error or exception
--nologcapture
	output all logging during test execution

Get notified
""""""""""""

Test result notification bubbles are easy no-nonsense updates.

On Ubuntu, check out `nose-notify <https://github.com/passy/nose-notify>`__::

	install: $ pip install nose-notify
	use: $ nosetests --with-notify

On Mac, check out `nosegrowl2 <https://github.com/j4mie/nosegrowl2>`__::

	install: $ pip install nosegrowl2
	use: $ nosetests --with-growl

Let watchdog run the tests
""""""""""""""""""""""""""

[watchdog](https://github.com/gorakhargosh/watchdog) watches your files, and lets you take action based on what changed - in this case, run tests!::

	install: $ pip install watchdog
	use: $ watchmedo shell-command --patterns="*.py" --recursive --command='nosetests --with-notify'

(and let watchdog build the docs, too)
''''''''''''''''''''''''''''''''''''''
::

	$ cd docs
	$ watchmedo shell-command --patterns="*.rst" --recursive --command='make html'


Write tests
~~~~~~~~~~~

Check out `"writing tests" <https://nose.readthedocs.org/en/latest/writing_tests.html>`__ in the `nose documentation <https://nose.readthedocs.org/en/latest/>`__.

