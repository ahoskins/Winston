<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1527504/6770564/2997abf8-d089-11e4-86cc-ad0fcada6a4e.png" />
</p>
Winston:
-----------------------------

Winston is a schedule-building web app for University of Alberta students.
 - Curious about a course? Browse the catalog with realtime search
 - Got a busy semester? Block off your commitments and Winston will work around them
 - Like to sleep in? Block off your mornings

It lives at http://heywinston.com. 

Winston is **not** official University of Alberta software - it is built by students for students.

![find a schedule](https://cloud.githubusercontent.com/assets/1527504/6770386/2556e57c-d084-11e4-8c4a-76d79ef0b90c.png)

Tech Stack
------------------------
Winston relies on [classtime](https://github.com/rosshamish/classtime) for course data and schedule generation.  classtime has extensive documentation linked on its own project README.  classtime was developed in parallel with Winston, but is very extensible to other platforms.

Winston itself is an AngularJS web app.  It does not directly talk to the University of Alberta LDAP server, it requests API endpoints from classtime.  Neither does it do schedule generation - this is also done on classtime.  Winston consists of two main UI pieces: an accordion to show couse data, and a schedule view for showing schedules and adding busy time.

The course data is displayed in an triply nested accordion which lazily renders each panel as its opened.  Lazily rendering the accordion has huge performance benefits that allow it to be smooth on both web and mobile.

For the schedule view, it uses a heavily customized version of [FullCalendar](http://fullcalendar.io/).  The calendar allows resizeable busy times to be drawn on it with a click of the mouse or tap of the finger.

Usability is a huge focus.  We aim to not need instructions or help buttons - the UI should be intuitive enough.  Mobile friendliness is also a huge focus.  Each feature works the same on mobile as web, and we try to minimize performance loss.

Winston uses a Node server and Jade templates, so it's pretty easy on the eyes.  It's built in production with gulp.js, and hosted in Heroku.

Contributing
---------------------------
At the moment Winston does not have test coverage, but this is high on the list of priorities.  Once test coverage is in place, contributions will be very welcome.

For now, feel free to submit an issue with any suggestions or bugs!

Goal
----------------------------
The goals of Winston and classtime together are to help students quickly make schedules tailored around their lives. 

With inspiration from:
---------------------
- [John Resig, Ben Russell, and Ben Grawi's schedule maker for the Rochester Institute of Technology](http://schedule.csh.rit.edu/)
- [morinted, t0xicCode, and DanielMurdoch's 'schedule-generator' for the University of Ottawa](https://github.com/morinted/schedule-generator)
- [cosbynator's 'course qualifier' for the University of Waterloo](https://github.com/cosbynator/Course-Qualifier), demo: http://www.coursequalifier.com/
- [Uberi's 'COURSERATOR3000' for the University of Waterloo](https://github.com/Uberi/COURSERATOR3000)
- [scott113341's 'SCUclasses' for Santa Clara University](https://github.com/scott113341/SCUclasses), demo: http://scuclasses.com
- [adicu's 'Courses' for Columbia University](https://github.com/adi-archive/Schedule-Builder), demo: http://courses.adicu.com
- [adiciu's course data API for Columbia University](https://github.com/adicu/data.adicu.com)
- [arxanas's 'schedumich' for the University of Michigan](https://github.com/arxanas/schedumich)
