// Filter the list of courses
//
// There are two styles of filering.  The first builds the list up, and 
// second rips the list down as a search query is entered.  The second
// (the one that is not commented) seems to make more sense.
//
// coreModule.filter('courseFilter', function() {
//   return function(subjectBin, field) {
//         var result = {};
//         angular.forEach(subjectBin, function(value, key) {
//         	value.forEach(function (course) {
//         		if (course.subjectTitle.indexOf(field) > -1 || key.indexOf(field) > -1) {
//         			if (result.hasOwnProperty(key)) {
//         				result[key].push(course);
//         			}
//         			else {
//         				result[key] = [course];
//         			}
//         		}
//         	})
//         });
//         return result;
//     };
// });

coreModule.filter('courseFilter', function($window) {
  return function(subjectBin, field) {
        var result = subjectBin;

        angular.forEach(result, function(value, key) {
        	value.forEach(function (course) {
        		if (course.subjectTitle.indexOf(field) == -1 || key.indexOf(field) == -1) {
        			delete course;
        		}
        	})
        	// FIND CONDITION WHICH CHECKS IF VALUE IS ZERO LENGTH
        	// WHY IS THIS NOT WORKING, OMMMGGGG
        	// if () {
        	// 	delete result[key];
        	// }

        });
        return result;
    };
});