=====
Tests
=====

Core functionality is tested with
`nosetests <https://nose.readthedocs.org/en/latest/>`__.

Test suites are in the ``tests/`` directory. Test filenames are prefixed
with ``test_``. Test functions are prefixed with ``test_``.

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

Write tests
~~~~~~~~~~~

Check out `"writing tests" <https://nose.readthedocs.org/en/latest/writing_tests.html>`__ in the `nose documentation <https://nose.readthedocs.org/en/latest/>`__.