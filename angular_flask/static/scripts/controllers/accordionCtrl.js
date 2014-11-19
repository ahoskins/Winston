// Accordion Controller
//

coreModule.controller('accordionCtrl', ['$scope', '$window', 'courseFactory', '$timeout', 'detailFactory', '$rootScope', function($scope, $window, courseFactory, $timeout, detailFactory, $rootScope) {

    // Organized course object
    //
    // $scope.subjectBin = {
    //    "Faculty of Engineering": {
    //          "ECE": [{<courses-min-object>}, {<courses-min-object>}],
    //          "MEC E": [{<courses-min-object>}]
    //     },
    //    "Faculty of Science": {
    //          "CMPUT": [{<courses-min-object}]
    //     }
    // }
    $scope.subjectBin = {};

    // Read in courses from factory, courseFactory.js ////////////
    /////////////////////////////////////////////////////////////
    //
    // @callee: on page load
    //
    // @returns: sorted $scope.subjectBin
    var tempSubjectBin = {};

    courseFactory.getCoursesPage(1).
        success(function (data) {
            // De-serialize JSON data
            var pageListing = angular.fromJson(data),
                total_pages = pageListing.total_pages,
                page = 1;

            // In these calls, actually get and arrange the data
            while (page < (total_pages + 1)) {
                courseFactory.getCoursesPage(page).
                    success(function (data) {
                        // De-serialize JSON data
                        pageListing = angular.fromJson(data);

                        // For each course on page of results
                        pageListing.objects.forEach(function (course) {
                            if (tempSubjectBin.hasOwnProperty(course.faculty)) {
                                // We are within an existing faculty property
                                if (tempSubjectBin[course.faculty].hasOwnProperty(course.subject)) {
                                    tempSubjectBin[course.faculty][course.subject].push(course);

                                    // Sort the courses by course level number (small --> large)
                                    tempSubjectBin[course.faculty][course.subject].sort(compareByCourseNumber);
                                }
                                else {
                                    tempSubjectBin[course.faculty][course.subject] = [course];
                                }
                            }
                            else {
                                tempSubjectBin[course.faculty] = {};
                                tempSubjectBin[course.faculty][course.subject] = [course];
                            }
                        });
                    }).
                    error(function () {
                        $window.alert("Sorry, something went wrong.");
                    });

                page = page + 1;
            }
            $scope.subjectBin = tempSubjectBin;
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

    // Performance //////////////////////////////////////
    /////////////////////////////////////////////////////
    //
    //
    // @callee: 1st layer of accordion
    //

    // @callee: 2nd layer of accordion
    //
    // On click of the 2nd layer of the accordion
    // Will cause this 3rd layer to get rendered on the DOM and showed
    // Note: the courses will still be in the DOM even when the accordion is closed
    $scope.subjects = [];
    $scope.renderCourses = function (subject) {
        $scope.subjects[subject] = 1;
    };

    // @callee: 3rd layer of accordion
    //
    // On click of 3rd layer of accordion
    // Retrieves course details and displays it
    $scope.description = {};
    $scope.showId = [];
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

    // Wait 0.5 seconds until displaying any courses
    //
    // Without this delay the courses will immediately load, freeze up for a second, and then finally finish
    // This is hides this lag (I better come up with a better fix eventually)
    $timeout(function() {
        $scope.filterText = '';
    }, 1000);

    // Watcher: search box filter
    //
    // Sets a watch on the input search box (every 200ms)
    // This affects the normal $digest cycle
    var filterTextTimeout;
    $scope.$watch('searchBox', function(val) {
        if (!isString(val)) {
            return;
        }

        if (filterTextTimeout) {
            $timeout.cancel(filterTextTimeout);
        }
        filterTextTimeout = $timeout(function() {
            $scope.filterText = val.toUpperCase();
        }, 200);
    });

    // Add to Schedule ////////////////////////////////////
    ///////////////////////////////////////////////////////
    //
    // Add course to schedule
    //
    $rootScope.addedCourses = [];
    $rootScope.shoppingCartSize = 0;

    // @callee: "Add" button under 3rd layer of accordion
    //
    $scope.addToSchedule = function (course) {
        // Only add if the course isn't already there
        if ($rootScope.addedCourses.indexOf(course) === -1) {
            $rootScope.addedCourses.push(course);

            // Update view tally
            $rootScope.shoppingCartSize = $rootScope.shoppingCartSize + 1;
        }
    };

    // Helper functions ///////////////////////////////////
    ///////////////////////////////////////////////////////
    //
    var isNumber = function(val) {
        return !isNaN(parseFloat(val));
    };
    var isString = function(val) {
        return (typeof val === "string");
    };

}]);



