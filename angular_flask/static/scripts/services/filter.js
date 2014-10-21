// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE
coreModule.filter('courseFilter', function() {
  return function(subjectBin, field) {
        var result = {};

        // For each key-value pair in SubjectBin
        // Example--> ECE: [{course obj 1}, {course obj 2}]
        angular.forEach(subjectBin, function (value, key) {
            // For each course
            // Example--> {course obj 1}
        	value.forEach(function (course) {
                // If the string entered in the HTML input box matches any of the following
                // Note: toUpperCase() is a word-around to allow case in-sensitive comparison
        		if (course.subjectTitle.toUpperCase().indexOf(field.toUpperCase()) > -1
                || key.toUpperCase().indexOf(field.toUpperCase()) > -1
                || course.asString.toUpperCase().indexOf(field.toUpperCase()) > -1) { 
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









