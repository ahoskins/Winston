// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

coreModule.filter('courseFilter', function() {
    // $scope.subjectBin is passed in as parameter subjectBin
    // $scope.filterText is passed in as parameter field
    //
    // returns an Object congruent with user search
   return function(subjectBin, field) {
        // entire filter
        var result = {},
            faculty,
            subject;

        // For each key-value pair in SubjectBin
        // Example--> ECE: [{course obj 1}, {course obj 2}]
        angular.forEach(subjectBin, function (value, key) {
            // key is "Engineering"
            //
            faculty = key;
            angular.forEach(value, function (value, key) {
                // key is "ECE"
                subject = key;
                value.forEach(function (asString) {
                    if (asString.asString.toUpperCase().indexOf(field.toUpperCase()) > -1 ||
                        faculty.toUpperCase().indexOf(field.toUpperCase()) > -1  ||
                        subject.toUpperCase().indexOf(field.toUpperCase()) > -1 ) {
                        if (result.hasOwnProperty(faculty)) {
                            if (result[faculty].hasOwnProperty(subject)) {
                                result[faculty][subject].push(asString);
                            }
                            else {
                                result[faculty][subject] = [asString];
                            }
                        }
                        else {
                            result[faculty] = {};
                            result[faculty][subject] = {};
                            result[faculty][subject] = [asString];
                        }
                    }
                });
            });
        });


        return result;

   };
});


// EXPERIMENT
// Using a different kind of loop
// This was experimental to see if it went faster
// It does not seem to run any fast than the above
//
// coreModule.filter('courseFilter', function() {
//     return function(subjectBin,field) {

//         var result = {};

//         for (var property in subjectBin) {
//                 for (var course in subjectBin[property]) {
//                     // If the string entered in the HTML input box matches any of the following
//                     // Note: toUpperCase() is a word-around to allow case in-sensitive comparison
//                     if (subjectBin[property][course].subjectTitle.toUpperCase().indexOf(field.toUpperCase()) > -1 ||
//                         property.toUpperCase().indexOf(field.toUpperCase()) > -1 ||
//                         subjectBin[property][course].asString.toUpperCase().indexOf(field.toUpperCase()) > -1) { 
//                         // If the "result" object already has the property, just add it on  
//                         if (result.hasOwnProperty(property)) {
//                             result[property.push(subjectBin[property][course]);
//                         }
//                         // Otherwise, create a new property on the "result" object and initiate its array
//                         else {
//                             result[property = [subjectBin[property][course]];
//                         }
//                     }     
//                 }
    
//         }
//         return result;
//     };
// });











