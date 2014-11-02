// Classes Controller
//

coreModule.controller('fastCourseListCtrl', ['$scope', '$window', 'fastCourseFactory', '$timeout', 'detailFactory', function($scope, $window, fastCourseFactory, $timeout, detailFactory) {

    // UI cal testing around
    //
    /* config object */
//    $scope.uiConfig = {
//        calendar:{
//            height: 450,
//            editable: true,
//            header:{
//                left: 'month basicWeek basicDay agendaWeek agendaDay',
//                center: 'title',
//                right: 'today prev,next'
//            },
//            dayClick: $scope.alertEventOnClick,
//            eventDrop: $scope.alertOnDrop,
//            eventResize: $scope.alertOnResize
//        }
//    };
//
//    $scope.eventSources = [
//        {
//            title  : 'event1',
//            start  : '2010-01-01'
//        },
//        {
//            title  : 'event2',
//            start  : '2010-01-05',
//            end    : '2010-01-07'
//        },
//        {
//            title  : 'event3',
//            start  : '2010-01-09T12:30:00',
//            allDay : false // will make the time show
//        }
//    ];

    // END UI cal testing around

    // New, organized course object
    $scope.subjectBin = {};

    // De-serialized API data
    var pageListing;

    // Counters for pageListing
    var page  = 1,
        total_pages;

    // Purpose of first call is to get total_pages amount
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

                        // For each course on page of results
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
    // Sets a watch on the input search box (every 500ms)
    // This affects the normal $digest cycle
	var filterTextTimeout;
	$scope.$watch('searchBox', function(val) {
		if (filterTextTimeout) {
			$timeout.cancel(filterTextTimeout);
		}
		filterTextTimeout = $timeout(function() {
			$scope.filterText = val.toUpperCase();
		}, 500);
	});

    // On the click of a single course in the accordion
    //
    // Retrieves course details and displays it
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



