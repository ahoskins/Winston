/*
This service works as an OBJECT CONSTUCTOR

It is the middle-man between courseFactory.js (the connection to API) and the accordionCtrl

This is ultimately just abstracting away the SubjectBin creation from the controller.  It saves the accordionCtrl from being bloated.

Note: the calls to the API are done in an asynchronious way

Structure of SubjectBin object: 

    $scope.subjectBin = [{
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

	// Class: Faculty
    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

    // Parse each faculty on the page
    function parsePage(pageListing) {
        pageListing.objects.forEach(function(SFacultyGroup) {
            // Insert object into subjectBin
            insertIntoSubjectBin(SFacultyGroup);
        });
    }

	/*
    Insert each faculty into self.data
    */
    function insertIntoSubjectBin(SFacultyGroup) {
        var inserted = false;
        var SfacultyName = SFacultyGroup.faculty;

        // Case 1: Insert into already existing faculty
        factory.data.forEach(function(subjectBinObject) {
            if (subjectBinObject.faculty === SfacultyName) {

                // faculty object already exists
                // Push onto subjects array
                SFacultyGroup.subjects.forEach(function(Ssubject) {
                    subjectBinObject.subjects.push(Ssubject);
                });
                inserted = true;
            }
        });

        // Case 2: create new faculty and insert
        if (!inserted) {
            //console.log("created new faculty");
            var subjects = [];
            SFacultyGroup.subjects.forEach(function (subject) {
                subjects.push(subject);
            });

            var newObj = new FacultyObject(SfacultyName, subjects);

            factory.data.push(newObj);
        }
    }

    var factory = {};

    factory.data = [];

    // Function which returns a promise that $routeProvider can deal with
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

	// Expose the service
	return factory;
	
}])