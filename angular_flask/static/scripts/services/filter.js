// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

coreModule.filter('courseFilter', function() {
    // Invoked from index.html accordion
    // Used filterText to trim subjectBin
    // @param {Object} $scope.subjectBin is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.subjectBin
   return function(subjectBin, field) {

        var result = {},
            faculty,
            subject,
            courseSafe;

        // For each key-value pair in SubjectBin
        // Example--> ECE: [{course obj 1}, {course obj 2}]
        angular.forEach(subjectBin, function (value, key) {
            // key is "Engineering"
            faculty = key;
            angular.forEach(value, function (value, key) {
                // key is "ECE"
                subject = key;
                value.forEach(function (course) {
                    if (course.asString.toUpperCase().indexOf(field) > -1 ||
                        faculty.toUpperCase().indexOf(field) > -1  ||
                        subject.toUpperCase().indexOf(field) > -1 ) {
                        if (result.hasOwnProperty(faculty)) {
                            if (result[faculty].hasOwnProperty(subject)) {
                                result[faculty][subject].push(course);
                            }
                            else {
                                result[faculty][subject] = [course];
                            }
                        }
                        else {
                            result[faculty] = {};
                            result[faculty][subject] = {};
                            result[faculty][subject] = [course];
                        }
                    }
                });
            });
        });

        return result;
   };
});











