// Classes Controller
//
coreModule.controller('fastCourseListCtrl', ['$scope', '$window', 'fastCourseFactory', function($scope, $window, fastCourseFactory) {
	// New, organized course object
	$scope.subjectBin = {};
	var subjectBin = {};

	// temp used in transfer to new course object
	var pageListing;

	for (var i = 1; i <= 8; i++) {

		// Purpose of first call is purely to scrape total_pages
		fastCourseFactory.getCoursesPage(i).
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
			$window.alert("Sorry, something went wrong.");
		});	

	}


	// Gather new object
	$scope.subjectBin = subjectBin;

 	$scope.items = {
                 'A2F0C7':{'secId':'12345', 'pos':'a20'},
                 'C8B3D1':{'pos':'b10'}
               };

}]);



