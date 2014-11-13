// Accordion Controller
//

coreModule.controller('accordionCtrl', ['$scope', '$window', 'courseFactory', '$timeout', 'detailFactory', '$rootScope', function($scope, $window, courseFactory, $timeout, detailFactory, $rootScope) {

    // New, organized course object
    $scope.subjectBin = {};

    // De-serialized API data
    var pageListing;

    // Counters for pageListing
    var page  = 1,
        total_pages;

    // Purpose of first call is to get total_pages amount
    courseFactory.getCoursesPage(1).
    success(function (data, status, headers, config) {
            // De-serialize JSON data
            pageListing = angular.fromJson(data);
            total_pages = pageListing.total_pages;

            // In these calls, actually get and arrange the data
            while (page < (total_pages + 1)) {
                courseFactory.getCoursesPage(page).
                    success(function (data, status, headers, config) {
                        // De-serialize JSON data
                        pageListing = angular.fromJson(data);

                        // For each course on page of results
                        pageListing.objects.forEach(function (course) {
                            if ($scope.subjectBin.hasOwnProperty(course.faculty)) {
                                // We are within an existing faculty property
                                if ($scope.subjectBin[course.faculty].hasOwnProperty(course.subject)) {
                                    $scope.subjectBin[course.faculty][course.subject].push(course);

                                    // Sort the courses by course level number (small --> large)
                                    $scope.subjectBin[course.faculty][course.subject].sort(compareByCourseNumber);
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


    // Sort by asString property
    //
    // @param {Object} course object, from courses-min
    // @param {Object} course object, from courses-min
    //
    // @return {int} compare result
    function compareByCourseNumber(a, b) {
        var aNum = a.asString.match(/\d+/);
        var bNum = b.asString.match(/\d+/);

        if (aNum < bNum) {
            return -1;
        }
        else if (aNum > bNum) {
            return 1;
        }
        else {
            return 0;
        }
    }

    // Wait 0.5 seconds until displaying any courses
    //
    // Without this delay the courses will immediately load, freeze up for a second, and then finally finish
    // This is hides this lag (I better come up with a better fix eventually)
    $timeout(function() {
        $scope.filterText = '';
    }, 500);

    // Filter watcher
    //
    // Sets a watch on the input search box (every 200ms)
    // This affects the normal $digest cycle
	var filterTextTimeout;
	$scope.$watch('searchBox', function(val) {
		if (filterTextTimeout) {
			$timeout.cancel(filterTextTimeout);
		}
		filterTextTimeout = $timeout(function() {
			$scope.filterText = val.toUpperCase();
		}, 200);
	});

    // On the click of a single course in the accordion
    //
    // Retrieves course details and displays it
    $scope.description = {};
    $scope.loadMore = function (courseIdNumber) {
        // Only call API if not yet added to $scope.description
        if (!$scope.description.hasOwnProperty(courseIdNumber)) {
            detailFactory.getDetails(courseIdNumber).
                success(function (data) {
                    var result = angular.fromJson(data);
                    $scope.description[courseIdNumber] = result.courseDescription;
                })
                .error(function () {
                    $window.alert("Something fucked up.");
                });
        }
    };

    // Speed up the accordion drastically with three lines
    //
    // renderCourses is called on every click of the 2nd layer of the accordion
    // it will cause this layer to show its courses
    // note: the courses will still be in the DOM even when the accordion is closed
    $scope.subjects = [];
    $scope.renderCourses = function (subject) {
        $scope.subjects[subject] = 1;
    };

    // Add course to schedule
    //
    $rootScope.addedCourses = [];
    $rootScope.shoppingCartSize = 0;

    $scope.addToSchedule = function (course) {
        // Only add if the course isn't already there
        if ($rootScope.addedCourses.indexOf(course) === -1) {
            $rootScope.addedCourses.push(course);

            // Update view tally
            $rootScope.shoppingCartSize = $rootScope.shoppingCartSize + 1;
        }
    };

}]);



