// Accordion Controller
//

coreModule.controller('accordionCtrl', ['$scope', '$window', 'courseFactory', '$timeout', 'detailFactory', '$rootScope', function($scope, $window, courseFactory, $timeout, detailFactory, $rootScope) {

    // OLD $scope.subjectBin
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

    // NEW $scope.subjectBin
    // $scope.subjectBin = [{
//          faculty: 'Faculty of Engineering',
//          subjects: [{
//             subject: 'ECE',
//             courses: [{course-object>}...]
//          }, {
//             subject: 'MEC E',
//             courses: [{<course-object>},...]
//          }]
//    }];

    $scope.subjectBin = [];

    // Request /api/courses-min
    var pageListing;
    courseFactory.getCoursesPage(1).
        success(function (data) {

            pageListing = angular.fromJson(data);

            var total_pages = pageListing.total_pages;

            parsePage(pageListing);

            //Get remaining pages
            var page = 2;

            // Asynchronously request the rest of the pages
            while (page <= total_pages) {
                courseFactory.getCoursesPage(page).
                    success(function (data) {
                        pageListing = angular.fromJson(data);

                        parsePage(pageListing);

                        if (pageListing.page === total_pages) {
                            console.log($scope.subjectBin);
                        }

                    });
                page = page + 1;
            }

        }).
        error(function () {
            $window.alert("Failed to get data");
        });

    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

    function insertIntoSubjectBin(SFacultyGroup) {
        var inserted = false;
        var SfacultyName = SFacultyGroup.faculty;

        // Case 1: Insert into already existing faculty
        $scope.subjectBin.forEach(function(subjectBinObject) {
            if (subjectBinObject.faculty === SfacultyName) {

                // faculty object already exists
                // Push onto subjects array
                SFacultyGroup.subjects.forEach(function(Ssubject) {
                    subjectBinObject.subjects.push(Ssubject);
                });
                inserted = true;
            }
        });

        // Case 2: create new faculty and insert
        if (!inserted) {
            //console.log("created new faculty");
            var subjects = [];
            SFacultyGroup.subjects.forEach(function (subject) {
                subjects.push(subject);
            });

            var newObj = new FacultyObject(SfacultyName, subjects);

            $scope.subjectBin.push(newObj);
        }
    }

    function parsePage(pageListing) {
        pageListing.objects.forEach(function(SFacultyGroup) {
            // Insert object into subjectBin
            insertIntoSubjectBin(SFacultyGroup);
        });
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



