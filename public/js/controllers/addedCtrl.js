winstonApp.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', 'currentTerm', '$timeout', function($scope, $location, $interval, ngProgressLite, addedCourses, $window, currentTerm, $timeout) {

    // This isn't defined because its null at the time of this code running
    // With empty preferences, addedCourses.data doesn't get a term ID set until the accordion
    $timeout(function() {
        $scope.added = addedCourses.data[currentTerm.termId];
    }, 1000);

    $scope.currentTerm = currentTerm;

    var colorIndex = 0;
    var groupColors = ['#CE93D8', '#90CAF9', '#FFCC80'];

    $scope.viewSchedules = function() {
        $location.path('/schedule');
        ngProgressLite.start();
    }

    $scope.emptyAll = function() {
        addedCourses.data[currentTerm.termId].length = 0;
    }

    $scope.emptyCourse = function(course) {
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

    $scope.setStyle = function(id) {
        return { 'background-color': groupColors[id] }
    }

    $scope.groupFreeze = false;
    $scope.newElectiveGroup = function() {
        addedCourses.data[currentTerm.termId].push(new ElectiveGroup(count ++));
        $scope.groupFreeze = true;
    }

    var draggedCourse = null;
    $scope.onDrag = function(e, ui, course) {
        draggedCourse = course;
    }

    function removeCourse(targetCourse) {
        var groupIndex = 0;
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            var courseIndex = 0;
            group.courses.forEach(function(course) {
                if (course === targetCourse) {
                    group.courses.splice(courseIndex, 1);
                    // Empty elective groups go away
                    if (group.courses.length === 0 && groupIndex > 0) {
                        addedCourses.data[currentTerm.termId].splice(groupIndex, 1);
                    }
                }
                courseIndex ++;
            });
            groupIndex ++;
        });
    }

    function addCourse(droppedGroup, newCourse) {
        var groupIndex = 0;
        addedCourses.data[currentTerm.termId].forEach(function(group) {
            if (group.id == droppedGroup.id) {
                group.courses.push(newCourse);
                if (groupIndex === addedCourses.data[currentTerm.termId].length - 1) {
                    $scope.groupFreeze = false;
                }
            }
            groupIndex ++;
        });
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        removeCourse(draggedCourse);
        addCourse(droppedGroup, draggedCourse);
    }

}]);