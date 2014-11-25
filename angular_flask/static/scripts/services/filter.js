// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

coreModule.filter('courseFilter', ['pmkr.filterStabilize', '$window', '$rootScope', function(stabilize, $window, $rootScope) {
    // Invoked from index.html accordion
    // Used filterText to trim subjectBin
    // @param {Object} $scope.subjectBin is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.subjectBin
    return stabilize(function(subjectBin, field) {
        // Subject Object Class
        function SubjectObject(subject, subjectTitle, courses) {
            this.courses = courses;
            this.subject = subject
            this.subjectTitle = subjectTitle;
        }

        // Faculty Object Class
        function FacultyObject(faculty, subjects) {
            this.faculty = faculty;
            this.subjects = subjects;
        }

        // Worker function for adding a courseObject to results
        function addCourseToResult(result, courseObject, faculty, subject, subjectTitle) {
            /*
             * Take advantage of the fact that course data comes from the server
             * already sorted by FACULTY, then SUBJECT, then COURSE
             */
            var facultyObj = null;
            var subjectObj = null;
            if (result.length > 0 && result[result.length-1].faculty == faculty) {
                facultyObj = result[result.length-1]
                facultySubjects = facultyObj.subjects
                if (facultySubjects[facultySubjects.length-1] == subject) {
                    subjectObj = facultySubjects[facultySubjects.length-1]
                    subjectObj.courses.push(courseObject);
                }
            }

            if (facultyObj === null) {
                facultyObj = new FacultyObject(faculty,
                                               [new SubjectObject(subject, subjectTitle,
                                                                  [courseObject])
                                               ]);

                // Push onto result
                result.push(facultyObj);

            } else if (subjectObj === null) {
                // Create subject object within this faculty and insert
                subjectObj = new SubjectObject(subject, subjectTitle,
                                               [courseObject]);

                // Push onto result
                facultyObj.subjects.push(subjectObj);
            }
        }

        function addCoursesToResultIfMatching(result, subjectObject) {
            subject = subjectObject.subject;
            subjectTitle = subjectObject.subjectTitle;

            subjectObject.courses.forEach(function (courseObject) {
                if (faculty.toUpperCase().indexOf(field) > -1 ||
                    subject.toUpperCase().indexOf(field) > -1 ||
                    courseObject.asString.toUpperCase().indexOf(field) > -1) {
                    // Add this course to the object

                    addCourseToResult(result, courseObject, faculty, subject, subjectTitle);
                }
            });
        }

        var result = []
        if (typeof field === 'undefined' || field.length < 2) {
            return subjectBin;
        }

        var faculty, subject, subjectTitle;
        subjectBin.forEach(function (facultyObject) {
            faculty = facultyObject.faculty;
            facultyObject.subjects.forEach(function (subjectObject) {
                addCoursesToResultIfMatching(result, subjectObject);
            });
        });
        return result;
    });
}]);











