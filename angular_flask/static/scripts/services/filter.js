// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

winstonApp.filter('courseFilter', ['pmkr.filterStabilize', '$window', function(stabilize, $window) {
    // Invoked from index.html accordion
    // Used filterText to trim subjectBin
    // @param {Object} $scope.subjectBin is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.subjectBin
    // BUILD-UP METHOD
    //
    return stabilize(function(subjectBin, field) {

        var result = [];

        // Class: Subject
        function SubjectObject(courses, subject, subjectTitle) {

            this.courses = courses;
            this.subject = subject;
            this.subjectTitle = subjectTitle;
        }

        // Class: Faculty
        function FacultyObject(faculty, subjects) {
            this.faculty = faculty;
            this.subjects = subjects;
        }

        var coursesArray,
            createdSubjectObject,
            createdFacultyObject,
            createdSubjectObjectArray;

        // Take in course object and associate parameters with that course
        function tryAddingToExistingFaculty(courseObject, faculty, subject, subjectTitle) {

            var inserted = false;

            // Check if faculty exists
           result.forEach(function (facultyObjectWithinResult) {
                if (facultyObjectWithinResult.faculty === faculty) {

                    // Find the correct subject within this faculty
                    facultyObjectWithinResult.subjects.forEach(function (subjectObject) {
                        if (subjectObject.subject === subject) {

                            inserted = true;
                            subjectObject.courses.push(courseObject);
                        }
                    });

                    // Faculty exists, but subject does not. Create a new subject
                    if (!inserted) {
                        inserted = true;

                        coursesArray = [courseObject];
                        createdSubjectObject = new SubjectObject(coursesArray, subject, subjectTitle);

                        // Push onto result
                        facultyObjectWithinResult.subjects.push(createdSubjectObject);
                    }

                }
            });

            // Faculty does no exist. Create a new faculty
            if (!inserted) {
                makeNewFaculty(courseObject, faculty, subject, subjectTitle);
            }

        }

        function makeNewFaculty(courseObject, faculty, subject, subjectTitle) {
            // create subject object first
            coursesArray = [courseObject];
            createdSubjectObject = new SubjectObject(coursesArray, subject, subjectTitle);
            createdSubjectObjectArray = [createdSubjectObject];

            createdFacultyObject = new FacultyObject(faculty, createdSubjectObjectArray);

            // Push onto result
            result.push(createdFacultyObject);
        }

        var faculty,
            subject,
            subjectTitle;

        // Iterate through subjectBin, invoking tryAddingToExistingFaculty on the courses who meet the query string requirements
        subjectBin.forEach(function (facultyObject) {
            // "Faculty of Engineering"
            faculty = facultyObject.faculty;
            facultyObject.subjects.forEach(function (subjectObject) {
                // "ECE"
                subject = subjectObject.subject;
                subjectTitle = subjectObject.subjectTitle;

                // For each course, check if it should be added
                subjectObject.courses.forEach(function (courseObject) {
                    if (faculty.toUpperCase().indexOf(field) > -1 ||
                        subject.toUpperCase().indexOf(field) > -1 ||
                        courseObject.asString.toUpperCase().indexOf(field) > -1) {

                        // Add this course to the object
                        tryAddingToExistingFaculty(courseObject, faculty, subject, subjectTitle);
                    }
                });
            });
        });

        // Return rebuild object
        return result;
    });

}]);



