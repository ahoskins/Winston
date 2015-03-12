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
    }

    var factory = {};

    factory.treeCourses = [];

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

