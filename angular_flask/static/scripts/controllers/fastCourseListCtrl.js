// Classes Controller
//

coreModule.controller('fastCourseListCtrl', ['$scope', '$window', 'fastCourseFactory', '$timeout', 'detailFactory', function($scope, $window, fastCourseFactory, $timeout, detailFactory) {

	// New, organized course object
	$scope.subjectBin = {};
    $scope.description;

	// temp used in transfer to new course object
	var pageListing;

    // Counters
    var page  = 1,
        total_pages;

    // Purpose of first call to getCoursesPage is to get total_pages
    fastCourseFactory.getCoursesPage(1).
    success(function (data, status, headers, config) {
            // De-serialize JSON data
            pageListing = angular.fromJson(data);
            total_pages = pageListing.total_pages;

            // In these calls, actually get and arrange the data
            while (page < (total_pages + 1)) {
                fastCourseFactory.getCoursesPage(page).
                    success(function (data, status, headers, config) {
                        // De-serialize JSON data
                        pageListing = angular.fromJson(data);

                        // For each course on page of results...
                        pageListing.objects.forEach(function (course) {
                            if ($scope.subjectBin.hasOwnProperty(course.faculty)) {
                                // We are within an existing faculty property
                                if ($scope.subjectBin[course.faculty].hasOwnProperty(course.subject)) {
                                    $scope.subjectBin[course.faculty][course.subject].push(course);
                                }
                                else {
                                    $scope.subjectBin[course.faculty][course.subject] = [course];
                                }
                            }
                            else {
                                $scope.subjectBin[course.faculty] = {};
                                $scope.subjectBin[course.faculty][course.subject] = [course];

                            }
                        });
                    }).
                    error(function () {
                        $window.alert("Sorry, something went wrong.");
                    });

                page = page + 1;
            }
    }).
    error(function () {
            $window.alert("Sorry, something went wrong.");
    });

    // Wait 0.5 seconds until displaying any courses
    //
    // Without this delay the courses will immediately load, freeze up for a second, and then finally finish
    // This is hides this lag (I better come up with a better fix eventually)
    $timeout(function() {
        $scope.filterText = '';
    }, 500);

    // Filter watcher
    //
    // This watches the ng-model called "searchBox" and changes the $scope filter, filterText, every 0.5 second
    // It is affecting the regular $digest cycle, which is normally on every state change of the input (new text)
	var filterTextTimeout;
	$scope.$watch('searchBox', function(val) {
		if (filterTextTimeout) {
			$timeout.cancel(filterTextTimeout);
		}
		filterTextTimeout = $timeout(function() {
			$scope.filterText = val;
		}, 500);
	});

    // This is run on the click of a couse accordion tab
    //
    // It retrieves the course details and displays it
    $scope.loadMore = function (num) {
        $scope.description = '';
        detailFactory.getDetails(num).
        success(function (data, status, headers, config) {
            var result = angular.fromJson(data);
            $scope.description = result.courseDescription;
        })
        .error(function () {
            $window.alert("Something fucked up.");
        });
    };

}]);



