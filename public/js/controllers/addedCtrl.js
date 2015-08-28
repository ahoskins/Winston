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

    // set the max-height to the current height of that span
    // when a list item is dropped, set the max-height for that element to infinite
    // then re-set the max-height to the current height of the span

    $scope.setStyle = function(id) {
        return {'background-color': groupColors[id]}
    }

    $scope.noMoreGroups = false;
    $scope.newElectiveGroup = function() {
        // max of three elective group
        if (addedCourses.data.length > 3) {
            return;
        }
        var electiveGroup = new ElectiveGroup(pickElectiveIndex());
        addedCourses.data.push(electiveGroup);
        if (addedCourses.data.length > 3) {
            $scope.noMoreGroups = true;
        }
    }

    var $draggedGroup = null;
    var draggedCourse = null;
    var draggedGroup = null;
    var height = null;
    $scope.onDrag = function(e, ui, course, group) {
        draggedCourse = course;
        $draggedGroup = $(ui.helper.context.parentElement);
        draggedGroup = group;
        height = e.currentTarget.clientHeight;
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        // everything in the `ui` object seems to refer to the dropped element, use the event instead
        var $droppedGroup = $(e.target);
        
        if ($droppedGroup.context.innerText !== $draggedGroup.context.innerText) {
            if (draggedGroup.courses.length !== 1) {
                $draggedGroup.animate({
                    height: '-=' + height + 'px'
                }, 500);
            }

            if (droppedGroup.courses.length !== 0) {
                $droppedGroup.animate({
                    height: '+=' + height + 'px'
                }, 500);
            } 
        }

        // if dragged course is already part of this group, destroy DOM element and rebuild
        // to fix the mismatched spacing that occurs with a moved list item
        // this is done by cloning JS objects, emptying (destroys DOM els), 
        // and re-inserting JS objects (creates DOM els)
        if (addedCourses.existsInGroup(draggedCourse, droppedGroup)) {
            // clone
            var save = [];
            droppedGroup.courses.forEach(function(course) {
                var c = angular.copy(course);
                save.push(c); 
            });
            // empty
            droppedGroup.courses.length = 0;

            // restore
            save.forEach(function(each) {
                var n = {}
                for (prop in each) {
                    if (each.hasOwnProperty(prop)) {
                        n[prop] = each[prop];
                    }
                }
                droppedGroup.courses.push(n);
            });
        } else {
            addedCourses.addToGroup(droppedGroup, draggedCourse);
        }
        addedCourses.updateLocalStorage();
    }

}]);