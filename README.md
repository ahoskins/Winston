Winston
=========

Find a university schedule in less than 5 minutes

![screenshot or image here](https://cloud.githubusercontent.com/assets/1527504/5326718/551e0544-7ce5-11e4-80a9-28a9ba9e2b11.png)

Documentation
-------------

Documentation follows [reStructuredText] syntax, looks great when built with [sphinx], and is best viewed in a browser.

Clone the repo
> $ git clone https://github.com/rosshamish/classtime  
> $ cd classtime  

Install requirements
> $ pip install -r requirements.txt  

Build with [sphinx]
> $ cd docs  
> $ make html  

View
> $ firefox _build/html/index.html &

When documentation is unclear, missing, or incorrect, [add an issue][issue-new] to the [docs work queue][milestones].

[reStructuredText]: http://docutils.sourceforge.net/docs/user/rst/quickref.html
[sphinx]: http://sphinx-doc.org/
[issue-new]: https://github.com/RossHamish/classtime/issues/new
[milestones]: https://github.com/RossHamish/classtime/milestones

Thanks
------

[Mason Strong](https://github.com/hadacigar) ([contact](mailto:mstrong@ualberta.ca)) and [Peter Crinklaw](http://blackacrebrewing.com/hey.swf) for ideas, advice, and for sharing the code from their Cmput 275 schedule-builder project as a point of reference.
