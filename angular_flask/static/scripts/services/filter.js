// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE
// var delay = (function(){
//   var timer = 0;
//   return function(callback, ms){
//     clearTimeout (timer);
//     timer = setTimeout(callback, ms);
//   };
// })();

coreModule.filter('courseFilter', function() {
  return function(subjectBin, field) {

        // entire filter
        var result = {};

        // For each key-value pair in SubjectBin
        // Example--> ECE: [{course obj 1}, {course obj 2}]
        angular.forEach(subjectBin, function (value, key) {

            // For each course
            // Example--> {course obj 1}
            value.forEach(function (course) {

                // If the string entered in the HTML input box matches any of the following
                // Note: toUpperCase() is a word-around to allow case in-sensitive comparison
                if (course.subjectTitle.toUpperCase().indexOf(field.toUpperCase()) > -1 ||
                    key.toUpperCase().indexOf(field.toUpperCase()) > -1 ||
                    course.asString.toUpperCase().indexOf(field.toUpperCase()) > -1) { 
                    // If the "result" object already has the property, just add it on  
                    if (result.hasOwnProperty(key)) {
                        result[key].push(course);
                    }
                    // Otherwise, create a new property on the "result" object and initiate its array
                    else {
                        result[key] = [course];
                    }
                }
            })
        });

        return result;

    };
});

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











