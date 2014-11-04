=========
Profiling
=========

Performance bottlenecks are found by `profiling <http://en.wikipedia.org/wiki/Profiling_%28computer_programming%29>`__ tests.

Profiling data is collected with `nose-cprof <https://github.com/msherry/nose-cprof>`__ and analyzed with `cprofilev <http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html>`__.

`nose-cprof <https://github.com/msherry/nose-cprof>`__ is a `nose plugin <http://nose.readthedocs.org/en/latest/plugins/builtin.html>`__ which gives nose access to python's builtin profiler, `cProfile <https://docs.python.org/2/library/profile.html>`__.

Get started
~~~~~~~~~~~

Use pip to install the nose-cprof plugin ::

 $ sudo pip install nose-cprof

Install `cprofilev <http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html>`__ ::

 $ sudo pip install cprofilev

Workflow
~~~~~~~~

Run the tests with the profiler attached ::
 
 $ nosetests [path/to/test/file] --with-cprof --cprofile-stats-file OUTPUT-FILE

:OUTPUT-FILE: filename to write profiling output to. Default="./stats.dat"

Start cprofilev ::

 $ cprofilev stats.dat

View and `analyze <http://ymichael.com/2014/03/08/profiling-python-with-cprofile.html>`__ ::

 http://localhost:5000