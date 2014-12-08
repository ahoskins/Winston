/*
This factory is a middle-man between courseFactory.js (the connection to API) and the accordionCtrl

This is ultimately just abstracting away the SubjectBin creation from the controller.  It saves the accordionCtrl from being bloated.

Note: the calls to the API are done in an asynchronious way
*/

winstonApp.factory('SubjectBin', ['courseFactory', function(courseFactory, $window){

	// Class: Faculty
    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

	/*
    Parse each faculty on page
    */
    function parsePage(pageListing, self) {
        pageListing.objects.forEach(function(SFacultyGroup) {
            // Insert object into subjectBin
            insertIntoSubjectBin(SFacultyGroup, self);
        });
    }

	/*
    Insert each faculty into self.bin
    */
    function insertIntoSubjectBin(SFacultyGroup, self) {
        var inserted = false;
        var SfacultyName = SFacultyGroup.faculty;

        // Case 1: Insert into already existing faculty
        self.bin.forEach(function(subjectBinObject) {
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

            self.bin.push(newObj);
        }
    }

    function invokeAPI(self) {
	    /*
	    Request /api/courses-min
	    Asynchronously request each page
	     */
	    var pageListing;
	    courseFactory.getCoursesPage(1).
	        success(function (data) {

	            pageListing = angular.fromJson(data);

	            var total_pages = pageListing.total_pages;

	            parsePage(pageListing, self);

	            //Get remaining pages
	            var page = 2;

	            // Asynchronously request the rest of the pages
	            while (page <= total_pages) {
	                courseFactory.getCoursesPage(page).
	                    success(function (data) {
	                        pageListing = angular.fromJson(data);

	                        parsePage(pageListing, self);

	                    });
	                page = page + 1;
	            }
	        }).
	        error(function () {
	            $window.alert("Failed to get data");
	        });
    }

    /*
	This is the object holding the hash-table-array-big-object-thingy, aka subjectBin 
    */
	var SubjectBin = function() {
		this.bin = [];

		// Preserve the proper "this"
		var self = this;

		this.initialize = function() {
			invokeAPI(self);
		}

		this.initialize();
	}


	// Return the above object
	return SubjectBin;
	
}])