// Classes Controller
//
coreModule.controller('CourseListCtrl', ['$scope', '$window', 'courseFactory', function($scope, $window, courseFactory) {
	// New, organized course object
	$scope.subjectBin = {};
	var subjectBin = {};

	// temp used in transfer to new course object
	var pageListing;

	// Counters
	var page = 1;
	var total_pages;

	// Purpose of first call is purely to scrape total_pages
	courseFactory.getCoursesPage(1).
	success(function (data, status, headers, config) {
		pageListing = angular.fromJson(data);
		total_pages = pageListing.total_pages;

		while (page != (total_pages + 1)) {
			courseFactory.getCoursesPage(page).
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
			});	

			// Increment to next page	
			page = page + 1;	
		}
	})

	// Gather new object
	$scope.subjectBin = subjectBin;

}]);



