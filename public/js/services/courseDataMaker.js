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

    function insertIntoSubjectBin(facultyObject) {
        var inserted = false;

        // Case 1: Insert into already existing faculty
        factory.data.forEach(function(subjectBinObject) {
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
            factory.data.push(new FacultyObject(facultyObject.faculty, s));
        }
    }

    function parsePage(pageListing) {
        pageListing.objects.forEach(function(facultyObject) {
            insertIntoSubjectBin(facultyObject);
        });
    }

    var factory = {};

    factory.data = [];

    factory.getCoursesDataPromise = function() {
        return (
            courseFactory.getCoursesPage(1).
                success(function(data) {
                    pageListing = angular.fromJson(data);
                    var total_pages = pageListing.total_pages;

                    parsePage(pageListing);

                    var page = 2;
                    while (page <= total_pages) {
                        courseFactory.getCoursesPage(page).
                            success(function(data) {
                                parsePage(angular.fromJson(data));
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

