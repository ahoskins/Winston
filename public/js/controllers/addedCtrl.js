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
        var index = addedCourses.data[currentTerm.termId].indexOf(course);
        addedCourses.data[currentTerm.termId].splice(index, 1);
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

    // Make sure I use the next count out of localstorage just like the busytime id's
    var count = 0;

    $scope.newElectiveGroup = function() {
        console.dir($scope.added);
        addedCourses.data[currentTerm.termId].push(new ElectiveGroup(count ++));
    }

    var draggedCourse = null;
    $scope.onDrag = function(e, ui, course) {
        draggedCourse = course;
    }

    // param: the group array from the main data-structure
    $scope.onDrop = function(e, ui, droppedGroup) {

        // Add to the dropped group
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            if (group.id == droppedGroup.id) {
                group.courses.push(draggedCourse);
            }
        });

        // Remove from its previous home
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            group.courses.forEach(function(course) {
                if (course === draggedCourse) {
                    delete draggedCourse;
                }
            });
        });
    }

}]);