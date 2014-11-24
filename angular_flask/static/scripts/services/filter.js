// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

coreModule.filter('courseFilter', ['pmkr.filterStabilize', '$window', function(stabilize, $window) {
    // Invoked from index.html accordion
    // Used filterText to trim subjectBin
    // @param {Object} $scope.subjectBin is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.subjectBin

    // ATTEMPT WITH: BUILD-UP METHOD
    //
    return stabilize(function(subjectBin, field) {

        var result = [];

        var faculty,
            subject,
            subjectTitle,
            coursesArray,
            subObj,
            facObj,
            subObjArray;

        // Subject Object Class
        function SubjectObject(courses, subject, subjectTitle) {
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
        function addCourseToResult(courseObject, faculty, subject, subjectTitle) {
            var facultyExists = false;
            var subjectExists = false;

            var facultyObjectThatExists = {};

            result.forEach(function (facultyObjectWithinResult) {
               if (facultyObjectWithinResult.faculty === faculty) {
                   // Corresponding faculty object already exists
                   facultyExists = true;

                   facultyObjectThatExists = facultyObjectWithinResult;

                   facultyObjectWithinResult.subjects.forEach(function (subjectObject) {
                      if (subjectObject.subject === subject) {
                          // Corresponding subject exists within the faculty
                          subjectExists = true;

                          subjectObject.courses.push(courseObject);
                      }
                   });
               }
            });

            if (!facultyExists) {
                // create subject object first
                coursesArray = [courseObject];
                subObj = new SubjectObject(coursesArray, subject, subjectTitle);
                subObjArray = [subObj];

                facObj = new FacultyObject(faculty, subObjArray);

                // Push onto result
                result.push(facObj);

                // Make sure the following block doesn't run
                subjectExists = true;
            }

            if (!subjectExists) {
                // Create subject object within this faculty and insert
                coursesArray = [courseObject];
                subObj = new SubjectObject(coursesArray, subject, subjectTitle);

                // Push onto result
                facultyObjectThatExists.subjects.push(subObj);
            }

        }

        // Iterate through subjectBin, invoking addCourseToResult on the courses who meet the query string requirements
        subjectBin.forEach(function (facultyObject) {
           faculty = facultyObject.faculty;
            facultyObject.subjects.forEach(function (subjectObject) {
                subject = subjectObject.subject;
                subjectTitle = subjectObject.subjectTitle;

                subjectObject.courses.forEach(function (courseObject) {
                    if (faculty.toUpperCase().indexOf(field) > -1 ||
                        subject.toUpperCase().indexOf(field) > -1 ||
                        courseObject.asString.toUpperCase().indexOf(field) > -1) {
                        // Add this course to the object

                        addCourseToResult(courseObject, faculty, subject, subjectTitle);
                    }
                });
            });
        });

        return result;
    });


    // ATTEMPT WITH: TEAR-DOWN METHOD
    //
    //return function(subjectB, field) {
    //
    //    var faculty,
    //        subject;
    //
    //    var result = subjectB;
    //
    //    result.forEach(function(facultyObject) {
    //        faculty = facultyObject.faculty;
    //        facultyObject.subjects.forEach(function(subjectObject) {
    //            subject = subjectObject.subject;
    //
    //            subjectObject.courses.forEach(function (courseObject) {
    //               // Check if faculty, subject and or courses matches...otherwise remove
    //                if (faculty.toUpperCase().indexOf(field) > -1 ||
    //                    subject.toUpperCase().indexOf(field) > -1 ||
    //                    courseObject.asString.toUpperCase().indexOf(field) > -1) {
    //                    // Leave the course in the result
    //                }
    //                else {
    //                    // remove course from the result
    //                    var initial = subjectObject.courses.length;
    //                    subjectObject.courses.splice(subjectObject.courses.indexOf(courseObject), 1);
    //                    var final = subjectObject.courses.length;
    //                    if (initial - final === 1) {
    //                        //$window.alert("removed");
    //                    }
    //                   // $window.alert("course removed");
    //                }
    //            });
    //
    //            //$window.alert(subjectObject.courses.length);
    //            // If there are no courseObjects, then delete the subjectObject altogether
    //            if (subjectObject.courses.length === 0) {
    //                //$window.alert("here");
    //                $window.alert(facultyObject.subjects.indexOf(subjectObject));
    //                facultyObject.subjects.splice(facultyObject.subjects.indexOf(subjectObject), 1);
    //            }
    //        });
    //
    //        if (facultyObject.subjects.length === 0) {
    //            $window.alert("there");
    //            result.splice(result.indexOf(facultyObject), 1);
    //        }
    //    });
    //
    //    console.log(result);
    //
    //    return result;
    //};


    // LEGACY FILTER
    //
   //return stabilize(function(subjectBin, field) {
   //
   //     var result = {},
   //         faculty,
   //         subject;
   //
   //     // For each key-value pair in SubjectBin
   //     // Example--> ECE: [{course obj 1}, {course obj 2}]
   //     angular.forEach(subjectBin, function (value, key) {
   //         // key is "Engineering"
   //         faculty = key;
   //         angular.forEach(value, function (value, key) {
   //             // key is "ECE"
   //             subject = key;
   //             value.forEach(function (course) {
   //                 // Filter accounts for the following (examples):
   //                 //
   //                 // CMPUT 272, Computer Science, Faculty of Science
   //                 // ECE 325, Electrical and Computer Engineering, Faculty of Engineering
   //                 if (course.asString.toUpperCase().indexOf(field) > -1 ||
   //                     course.subjectTitle.toUpperCase().indexOf(field) > -1 ||
   //                     faculty.toUpperCase().indexOf(field) > -1 ) {
   //                     if (result.hasOwnProperty(faculty)) {
   //                         if (result[faculty].hasOwnProperty(subject)) {
   //                             result[faculty][subject].push(course);
   //                         }
   //                         else {
   //                             result[faculty][subject] = [course];
   //                         }
   //                     }
   //                     else {
   //                         result[faculty] = {};
   //                         result[faculty][subject] = {};
   //                         result[faculty][subject] = [course];
   //                     }
   //                 }
   //             });
   //         });
   //     });
   //
   //     return result;
   //});
}]);











