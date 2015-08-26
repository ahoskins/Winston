winstonApp.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', '$timeout', function($scope, $location, $interval, ngProgressLite, addedCourses, $window, $timeout) {

    $scope.added = addedCourses.data;

    $scope.viewSchedules = function() {
        $location.path('/schedule');
        ngProgressLite.start();
    }

    $scope.emptyAll = function() {
        addedCourses.empty();
        addedCourses.updateLocalStorage();
    }

    $scope.emptyCourse = function(course) {
        addedCourses.remove(course);
        addedCourses.updateLocalStorage();
    }

    /************************
           Electives
    *************************/

    $scope.electiveGroups = [];

    var groupColors = ['#CE93D8', '#90CAF9', '#FFCC80'];

    // Find the lowest available id
    function pickElectiveIndex() {
        var used = [];
        addedCourses.data.slice(1).forEach(function(group) {
            used.push(group.id);
        });

        var choice = null;
        for (var i = 0; i < 3; i ++) {
            if (used.indexOf(i) === -1) {
                choice = i;
                break;
            }
        }
        return choice;
    }

    function ElectiveGroup(name) {
        this.id = name;
        this.courses = [];
    }

    $scope.setStyle = function(id) {
        return { 'background-color': groupColors[id] }
    }

    $scope.groupFreeze = false;
    $scope.newElectiveGroup = function() {
        if (addedCourses.data.length > 4) {
            return;
        }
        var electiveGroup = new ElectiveGroup(pickElectiveIndex());
        addedCourses.data.push(electiveGroup);
        $scope.groupFreeze = true;
    }

    $scope.onDrag = function(e, ui, course) {
        addedCourses.draggedCourse = course;
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        // if dragged course is in the group, destroy the DOM and re-build it!
        if (addedCourses.existsInGroup(addedCourses.draggedCourse, droppedGroup)) {
            // deep copy the objects and rebuild
            // this will remove the DOM nodes, and put back
            // fixing any weird spacing caused by dropping in its own group
            // to essentially on any drop, the node is deleted and recreated
            var save = [];
            droppedGroup.courses.forEach(function(course) {
                var c = angular.copy(course);
                save.push(c); 
            });
            // empty the array
            droppedGroup.courses.length = 0;

            // restore
            save.forEach(function(each) {
                var n = {}
                // no need to check hasOwnProperty because I don't set these prototypes or inherit
                for (prop in each) {
                    n[prop] = each[prop];
                }
                droppedGroup.courses.push(n);
            });
        } else {
            if (!addedCourses.addToGroup(droppedGroup, addedCourses.draggedCourse)) {
                $scope.groupFreeze = false;
            }
        }
        addedCourses.updateLocalStorage();
    }

}]);