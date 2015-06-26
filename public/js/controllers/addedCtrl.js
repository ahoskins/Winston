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
        addedCourses.data.push(new ElectiveGroup(pickElectiveIndex()));
        $scope.groupFreeze = true;
    }

    var draggedCourse = null;
    $scope.onDrag = function(e, ui, course) {
        draggedCourse = course;
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        addedCourses.remove(draggedCourse);
        if (!addedCourses.addToGroup(droppedGroup, draggedCourse)) {
            $scope.groupFreeze = false;
        }
        addedCourses.updateLocalStorage();
    }

}]);