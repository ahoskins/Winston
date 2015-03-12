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

winstonApp.factory('courseDataMaker', ['courseFactory', '$window', function(courseFactory, $window){

    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

    function saveFacultyObjectToTree(facultyObject) {
        var inserted = false;

        // Case 1: Insert into already existing faculty
        factory.treeCourses.forEach(function(subjectBinObject) {
            if (subjectBinObject.faculty === facultyObject.faculty) {
                facultyObject.subjects.forEach(function(Ssubject) {
                    subjectBinObject.subjects.push(Ssubject);
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
        factory.flatCourses = flattenCourses(factory.treeCourses);
        factory.flatSubjects = flattenSubjects(factory.treeCourses);
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

    factory.getCoursesDataPromise = function() {
        return (
            courseFactory.getCoursesPage(1).
                success(function(data) {
                    pageListing = angular.fromJson(data);
                    var total_pages = pageListing.total_pages;

                    savePage(pageListing);

                    var page = 2;
                    while (page <= total_pages) {
                        courseFactory.getCoursesPage(page).
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
        )
    }

	return factory;	
}]);

