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

winstonApp.factory('courseDataMaker', ['courseFactory', '$window', 'currentTerm', 'localStorageService', 'courseCache', '$q', function(courseFactory, $window, currentTerm, localStorageService, courseCache, $q){

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
    }

    var factory = {};

    factory.getFlattenedCourses = function() {
        return _.chain(factory.treeCourses)
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

    factory.getFlattenedSubjects = function() {
        return _.chain(factory.treeCourses)
            .map(function(faculty) {
                return _.map(faculty.subjects, function(subject) {
                    return _.values(_.extend(
                        _.pick(subject, 'subject')));
                })
            })
            .flatten()
            .value();
    }

    factory.treeCourses = [];

    var total_pages = null;

    function getFirstPage() {
        return courseFactory.getCoursesPage(1, currentTerm.termId)
            .success(function(data) {
                var pageListing = angular.fromJson(data);
                total_pages = pageListing.total_pages;
                savePage(pageListing);
            })
            .error(function() {
                $window.alert("Server not responding.  All we can say is, try again later.");
            })
    }

    var total_pages = null;

    factory.coursesDataPromise = function() {
        return courseFactory.getCoursesPage(1, currentTerm.termId)
            .success(function(data) {
                var pageListing = angular.fromJson(data);
                total_pages = pageListing.total_pages;
                savePage(pageListing);
            })
            .error(function() {

            });
    }

    factory.getRemainingPromises = function() {
        page = 2;
        var promises = [];
        while (page <= total_pages) {
            var promise = courseFactory.getCoursesPage(page, currentTerm.termId)
                .success(function(data) {
                    savePage(angular.fromJson(data));
                })
                .error(function(data) {
                    $window.alert("Server not responding.  All we can say is, try again later.");
                })
            promises.push(promise);
            page = page + 1;
        }

        return $q.all(promises).then(function() {
            courseCache.data[currentTerm.termId] = factory.treeCourses;
            localStorageService.set('courseCache.data', courseCache.data);
        });
    }

	return factory;	

}]);

