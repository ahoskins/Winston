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

winstonApp.factory('SubjectBin', ['courseFactory', '$window', function(courseFactory, $window){

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
    Insert each faculty into self.bin
    */
    function insertIntoSubjectBin(SFacultyGroup) {
        var inserted = false;
        var SfacultyName = SFacultyGroup.faculty;

        // Case 1: Insert into already existing faculty
        fact.bin.forEach(function(subjectBinObject) {
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

            fact.bin.push(newObj);
        }
    }

    function invokeAPI() {
	    /*
	    Request /api/courses-min
	    Asynchronously request each page
	     */
	    var pageListing;
	    courseFactory.getCoursesPage(1).
	        success(function (data) {

	            pageListing = angular.fromJson(data);

	            var total_pages = pageListing.total_pages;

	            parsePage(pageListing);

	            //Get remaining pages
	            var page = 2;

	            // Asynchronously request the rest of the pages
	            while (page <= total_pages) {
	                courseFactory.getCoursesPage(page).
	                    success(function (data) {
	                        pageListing = angular.fromJson(data);

	                        parsePage(pageListing);

	                    });
	                page = page + 1;
	            }
	        }).
	        error(function () {
	            $window.alert("Failed to get data");
	        });
    }


    var fact = {};

    fact.bin = [];

    fact.populate = function() {
        // Asynchroniously fetch course results and put them into fact.bin
        invokeAPI();
    }

    fact.searchById = function(id) {
        var result = {};
        fact.bin.forEach(function(facultyObject) {
            facultyObject.subjects.forEach(function(subjectObject) {
                subjectObject.courses.forEach(function(courseObject) {
                    if (courseObject.course === id) {
                        result = courseObject;
                    }
                })
            })
        })
        return result;
    }

	// Expose the service
	return fact;
	
}])