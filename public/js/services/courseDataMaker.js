/*
Note: the calls to the API are done in an asynchronious way

Structure of courseData object: 

    $scope.courseData = [{
            faculty: 'Faculty of Engineering',
            subjects: [{
                subject: 'ECE',
                courses: [{course-object>}...]
            }, {
                subject: 'MEC E',
                courses: [{<course-object>},...]
            }]
     }];
*/

winstonApp.factory('courseDataMaker', ['courseFactory', '$window', 'currentTerm', function(courseFactory, $window, currentTerm){

    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

    function saveFacultyObjectToTree(facultyObject) {
        var inserted = false;

        // Case 1: Insert into already existing faculty
        factory.treeCourses.forEach(function(faculty) {
            if (faculty.faculty === facultyObject.faculty) {
                facultyObject.subjects.forEach(function(Ssubject) {
                    foundSubject = false;
                    faculty.subjects.forEach(function(subject) {
                        if (subject.subject === Ssubject.subject) {
                            foundSubject = true;
                            var courseLevelNumber = new RegExp('[0-9]+').exec(Ssubject.courses[0].asString).join();
                            if (courseLevelNumber < subject.courses[0].number) {
                                // concat at front
                                subject.courses = Ssubject.courses.concat(subject.courses);
                            } else {
                                // concat at end
                                subject.courses = subject.courses.concat(Ssubject.courses);
                            }
                        }
                    })
                    if (!foundSubject) {
                        faculty.subjects.push(Ssubject);
                    }
                });
                inserted = true;
            }
        });

        // Case 2: create new faculty and insert
        if (!inserted) {
            var s = [];
            facultyObject.subjects.forEach(function (subject) {
                s.push(subject);
            });
            factory.treeCourses.push(new FacultyObject(facultyObject.faculty, s));
        }
    }

    function savePage(pageListing) {
        pageListing.objects.forEach(function(facultyObject) {
            saveFacultyObjectToTree(facultyObject);
        });

        factory.flatCourses.length = 0; // clear, keep reference
        Array.prototype.push.apply(factory.flatCourses, flattenCourses(factory.treeCourses));
        factory.flatSubjects.length = 0; // clear, keep reference
        Array.prototype.push.apply(factory.flatSubjects, flattenSubjects(factory.treeCourses));
    }

    function flattenCourses(facultyArr) {
        return _.chain(facultyArr)
            .map(function(faculty) {
                return _.map(faculty.subjects, function(subject) {
                    return _.map(subject.courses, function(course) {
                        course['number'] = new RegExp('[0-9]+').exec(course.asString).join();
                        return _.extend(
                            _.pick(faculty, 'faculty'),
                            _.pick(subject, 'subject', 'subjectTitle'),
                            _.pick(course, 'course', 'asString', 'courseTitle', 'number'));
                    });
                });
            })
            .flatten()
            .value();
    }

    function flattenSubjects(facultyArr) {
        return _.chain(facultyArr)
            .map(function(faculty) {
                return _.map(faculty.subjects, function(subject) {
                    return _.values(_.extend(
                        _.pick(subject, 'subject')));
                })
            })
            .flatten()
            .value();
    }

    var factory = {};

    factory.treeCourses = [];
    factory.flatCourses = [];
    factory.flatSubjects = [];

    factory.coursesDataPromise = courseFactory.getCoursesPage(1, currentTerm.termId).
                        success(function(data) {
                            pageListing = angular.fromJson(data);
                            var total_pages = pageListing.total_pages;

                            savePage(pageListing);

                            var page = 2;
                            while (page <= total_pages) {
                                courseFactory.getCoursesPage(page, currentTerm.termId).
                                    success(function(data) {
                                        savePage(angular.fromJson(data));
                                    }).
                                    error(function(data) {
                                        $window.alert("Server not responding.  All we can say is, try again later.");
                                    })
                                page = page + 1;
                            }
                        }).
                        error(function() {
                            $window.alert("Server not responding.  All we can say is, try again later.");
                        })

	return factory;	
}]);

