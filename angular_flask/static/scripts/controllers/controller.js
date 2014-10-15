// Classes Controller
//
coreModule.controller('CourseListCtrl', ['$scope', '$window', 'courseFactory', function($scope, $window, courseFactory) {
	$scope.subjectBin = {};
	var subjectBin = {};
	var pageListing;
	for (var i = 0; i < 360; i++) {
		courseFactory.getClasses(i).
		success(function (data, status, headers, config) {
			// Deserialize JSON data
			pageListing = angular.fromJson(data);

			// For each course on page of results...
			pageListing.objects.forEach(function (course) {
				// If the property is already there, just add to it
				if (subjectBin.hasOwnProperty(course.subject)) {
					// Push course object onto matching subjectBin property
					subjectBin[course.subject].push(course);
				}
				else {
					// If not there, create new property and add a first course to it
					// Square brackets, [course] are necessary
					subjectBin[course.subject] = [course];
				}
			})

		}).
		error(function () {
			$window.alert("Sorry, something when wrong.");
			return -1;
		});
	}

	$scope.subjectBin = subjectBin;

}]);



