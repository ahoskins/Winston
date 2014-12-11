Find a university schedule that fits your life in less than 5 minutes

![](https://cloud.githubusercontent.com/assets/1527504/5326718/551e0544-7ce5-11e4-80a9-28a9ba9e2b11.png)

Developer Documentation
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

[Ryan Shea](http://ryaneshea.com) for his [angular-flask app boilerplate](https://github.com/rxl/angular-flask)

With inspiration from
------------
- [morinted, t0xicCode, and DanielMurdoch's 'schedule-generator' for the University of Ottawa](https://github.com/morinted/schedule-generator)
- [cosbynator's 'course qualifier' for the University of Waterloo](https://github.com/cosbynator/Course-Qualifier), demo: http://www.coursequalifier.com/
- [Uberi's 'COURSERATOR3000' for the University of Waterloo](https://github.com/Uberi/COURSERATOR3000)
- [scott113341's 'SCUclasses' for Santa Clara University](https://github.com/scott113341/SCUclasses), demo: http://scuclasses.com
- [adicu's 'Courses' for Columbia University](https://github.com/adi-archive/Schedule-Builder), demo: http://courses.adicu.com
- [adiciu's course data API for Columbia Universtiy](https://github.com/adicu/data.adicu.com)
- [arxanas's 'schedumich' for the University of Michigan](https://github.com/arxanas/schedumich)

- [others](https://github.com/search?o=desc&q=university+scheduling&ref=searchresults&s=stars&type=Repositories&utf8=%E2%9C%93)