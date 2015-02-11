// Accordion Controller
//

winstonControllers.controller('accordionCtrl', ['$scope', '$window', 'detailFactory', 'SubjectBin', '$timeout', '$location', 'addedCourses', function($scope, $window, detailFactory, SubjectBin, $timeout, $location, addedCourses) {

    /*
    ********************************************************************
    Construct a new SubjectBin factory.  The subjectBin data structure is a member.
    ********************************************************************
     */

    SubjectBin.populate();

    $scope.subjectBin = SubjectBin.bin;

    /*
    ******************************
    On-click of accordion handlers
    ******************************
     */

     // @callee: 1st layer of accordion (on click)
     //
     // When open -> logical true, when closed -> logical false
     $scope.subjects = [];
     // $window.alert(opened);
     $scope.renderSubjects = function (faculty, $event) {
        // Make sure accordion will either open or close as a result of this click
        // To the ensure the $scope.subjects[faculty] MATCHES open state of accordion
        if ($event.target.className !== "ng-binding") {
            return;
        }
        // Invert it
        $scope.subjects[faculty] = !$scope.subjects[faculty];
     }


    // @callee: 2nd layer of accordion (on click)
    //
    // When open -> logical true, when closed -> logical false
    $scope.courses = [];
    $scope.renderCourses = function (subject, $event) {
        if ($event.target.className !== "ng-binding") {
            return;
        }
        // Invert it
        $scope.courses[subject] = !$scope.courses[subject];
    };

    // @callee: 3rd layer of accordion
    //
    // On click of 3rd layer of accordion
    // Retrieves course details and displays it
    // Note: one it is displayed, never erased from the DOM (cut on calls to the server)
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
    Performance related
    **************************
     */

    // To accordion load, wait 500 ms before displaying any courses
    $timeout(function() {
        $scope.filterText = '';
        
    }, 500);

    // Watch the searchBox every 200ms
    var filterTextTimeout;
    $scope.$watch('searchBox', function(val) {
        // Suppress type warnings
        if (!isString(val)) {
            return;
        }

        // Start a press 200ms timeout
        if (filterTextTimeout) {
            $timeout.cancel(filterTextTimeout);
        }
        filterTextTimeout = $timeout(function() {
            $scope.filterText = val.toUpperCase();
        }, 200);

        // Make all ng-if's false
        for (index in $scope.subjects) {
            $scope.subjects[index] = 0;
        }
        for (index in $scope.courses) {
            $scope.courses[index] = 0;
        }

    });

    /*
    **********************************************************************
    Add to schedule
    This is the bridge between this controller and the schedule controller
    **********************************************************************
     */
     $scope.added = addedCourses.courseAdded;
    // @callee: "Add" button under 3rd layer of accordion
    // Only add if the course isn't already in addedCourses
    $scope.addToSchedule = function (courseObject) {
        if (addedCourses.data.indexOf(courseObject) === -1) {
            addedCourses.data.push(courseObject);
            addedCourses.courseAdded[courseObject.asString] = 1;
        }
    };

    /*
    @callee: "Generate Schedule" button
    Switch to the other view and controller
    */
    var readyMade = [];
    $scope.promptSchedules = function() {
        // Get the service to generate schedules
        $location.path('/schedule');
        //$scope.$emit('generate');
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



