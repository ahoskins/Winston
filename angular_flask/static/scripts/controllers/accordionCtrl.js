// Accordion Controller
//

coreModule.controller('accordionCtrl', ['$scope', '$window', 'courseFactory', '$timeout', 'detailFactory', '$rootScope', function($scope, $window, courseFactory, $timeout, detailFactory, $rootScope) {
   /*
    $scope.subjectBin = [{
            faculty: 'Faculty of Engineering',
            subjects: [{
                subject: 'ECE',
                courses: [{course-object>}...]
            }, {
                subject: 'MEC E',
                courses: [{<course-object>},...]
            }]
     }];
     */

    /*
    ********************************************************************
    Parse courses from /api/courses-min-structured into $scope.subjectBin
    This is done in an asynchronous way
    ********************************************************************
     */

    $scope.subjectBin = [];

    // Class: Faculty
    function FacultyObject(faculty, subjects) {
        this.faculty = faculty;
        this.subjects = subjects;
    }

    /*
    Request /api/courses-min-structured
    Asynchronously request each page
     */
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

                    });
                page = page + 1;
            }
        }).
        error(function () {
            $window.alert("Failed to get data");
        });

    /*
    Parse each faculty on page
     */
    function parsePage(pageListing) {
        pageListing.objects.forEach(function(SFacultyGroup) {
            // Insert object into subjectBin
            insertIntoSubjectBin(SFacultyGroup);
        });
    }

    /*
    Insert each faculty into $scope.subjectBin
     */
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


    /*
    ******************************
    On-click of accordion handlers
    ******************************
     */

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

    /*
    **************************
    Performance related issues
    **************************
     */

    // To hide lag, wait 1 second before displaying any courses
    $timeout(function() {
        $scope.filterText = '';
        
    }, 1000);

    // Watch the searchBox every 200ms
    // Gives the impression of less lag
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

    /*
    **********************************************************************
    Add to schedule
    This is the bridge between this controller and the schedule controller
    **********************************************************************
     */

    $rootScope.addedCourses = [];

    // @callee: "Add" button under 3rd layer of accordion
    // Only add if the course isn't already in $rootScope.addedCourses
    $scope.addToSchedule = function (courseObject) {
        if ($rootScope.addedCourses.indexOf(courseObject) === -1) {
            // Add course object
            $rootScope.addedCourses.push(courseObject);
        }
    };


    /*
    ****************
    Validation Functions
    ****************
     */
    var isNumber = function(val) {
        return !isNaN(parseFloat(val));
    };
    var isString = function(val) {
        return (typeof val === "string");
    };

}]);



