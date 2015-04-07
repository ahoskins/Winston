winstonApp.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', 'currentTerm', '$timeout', function($scope, $location, $interval, ngProgressLite, addedCourses, $window, currentTerm, $timeout) {

    // This isn't defined because its null at the time of this code running
    // With empty preferences, addedCourses.data doesn't get a term ID set until the accordion

    /*
    All this addedCourses stuff is in a really weird broken state right now lol
    Either I implement it right now completely disregarding localstorage
    OR fix localstorage first, then do this start to finish
    */
    $timeout(function() {
        $scope.added = addedCourses.data[currentTerm.termId];
    }, 1000);

    $scope.currentTerm = currentTerm;

    $scope.viewSchedules = function() {
        $location.path('/schedule');
        ngProgressLite.start();
    }

    $scope.emptyAll = function() {
        addedCourses.data[currentTerm.termId].length = 0;
    }

    $scope.emptyCourse = function(course) {
        // var index = addedCourses.data[currentTerm.termId].indexOf(course);
        // addedCourses.data[currentTerm.termId].splice(index, 1);
        removeCourse(course);
        addedCourses.courseAdded[currentTerm.termId][course.asString] = 0;
    }

    /************************
           Electives
    *************************/

    $scope.electiveGroups = [];

    function ElectiveGroup(name) {
        this.id = name;
        this.courses = [];
    }

    var count = addedCourses.data[currentTerm.termId].length - 1 || 0;

    $scope.newElectiveGroup = function() {
        addedCourses.data[currentTerm.termId].push(new ElectiveGroup(count ++));
    }

    var draggedCourse = null;
    $scope.onDrag = function(e, ui, course) {
        draggedCourse = course;
    }

    function removeCourse(targetCourse) {
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            var courseIndex = 0;
            group.courses.forEach(function(course) {
                if (course === targetCourse) {
                    group.courses.splice(courseIndex, 1);
                }
                courseIndex ++;
            });
        });
    }

    function addCourse(droppedGroup, newCourse) {
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            if (group.id == droppedGroup.id) {
                group.courses.push(newCourse);
            }
        });
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        removeCourse(draggedCourse);
        addCourse(droppedGroup, draggedCourse);
    }

}]);