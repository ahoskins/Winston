// Classes Controller
//
coreModule.controller('fastCourseListCtrl', ['$scope', '$window', 'fastCourseFactory', '$timeout', function($scope, $window, fastCourseFactory, $timeout) {

	// New, organized course object
	$scope.subjectBin = {};
	var subjectBin = {};

	// temp used in transfer to new course object
	var pageListing;

    // Counters
    var page  = 1;
    var total_pages;


    fastCourseFactory.getCoursesPage(1).
    success(function (data, status, headers, config) {
            // Deserialize JSON data
            pageListing = angular.fromJson(data);
            total_pages = pageListing.total_pages;

            while (page < (total_pages + 1)) {
                fastCourseFactory.getCoursesPage(page).
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

                page = page + 1;
            }
    }).
    error(function () {
            $window.alert("Sorry, something went wrong.");
        })


	// Gather new object received from the above
    //
	$scope.subjectBin = subjectBin;


    // Filter watcher
    //
    // This watches the ng-model called "searchBox" and changes the $scope filter, filterText, every 1 second
    // It is affecting the regular $digest cycle, which is normally on every ".keyup" on that input box
	var tempFilterText = '';
	var filterTextTimeout;
	$scope.$watch('searchBox', function(val) {
		if (filterTextTimeout) {
			$timeout.cancel(filterTextTimeout);
		}
		tempFilterText = val;
		filterTextTimeout = $timeout(function() {
			$scope.filterText = tempFilterText;
		}, 1000);
	});

}]);



