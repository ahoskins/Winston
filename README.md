Winston is a schedule-building web app for University of Alberta students.
 - Curious about a course? Browse the catalog with realtime search
 - Got a busy semester? Block off your commitments and Winston will work around them
 - Like to sleep in? Block off your mornings

It lives at http://heywinston.com. 

Winston is **not** official University of Alberta software - it is built by students for students.
 
![find a schedule](https://cloud.githubusercontent.com/assets/1527504/6770386/2556e57c-d084-11e4-8c4a-76d79ef0b90c.png)

Winston uses [classtime](https://github.com/rosshamish/classtime), a student-made UAlberta course data and schedule generation REST API.  This project was made in parallel with Winston, and is open for extensibility to other platforms.

Winston itself is a Node/Angular project built with gulp.js and served from Heroku.  It uses a heavily customized version of [FullCalendar](http://fullcalendar.io/) to show possible schedules and allow users to paint on busytimes.

The goals of Winston and classtime together is to help students quickly make schedules tailored around their lives and preferences.

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
