winstonApp.controller('addedCtrl', ['$scope', '$document', '$modalStack', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', '$timeout', '$modal', function($scope, $document, $modalStack, $location, $interval, ngProgressLite, addedCourses, $window, $timeout, $modal) {

    $scope.added = addedCourses.data;

    /*
    handle adding courses to core group (either from drop of from accordion)
    */
    $scope.$watch('added', function(newC, oldC) {
        height = $('.list-group-item').height();
        if (newC[0].courses.length > oldC[0].courses.length && newC[0].courses.length !== 1) {
            var $coreGroup = $('#core-group-container');
            $coreGroup.animate({
                height: '+=' + height + 'px'
            }, 500);
        }
    }, true);

    // will have to dismiss modal
    $scope.viewSchedules = function() {
        $location.path('/schedule');
        ngProgressLite.start();
        // thank the gods this exists
        $modalStack.dismissAll();
    }

    /*
    when delete course, animate down group size unless length 1 already
    */
    $scope.emptyCourse = function(course, group, e) {
        // can't animate smaller if only one course
        if (group.courses.length !== 1) {
            var $parentGroup = $(e.target.parentElement.parentElement.parentElement);
            $parentGroup.animate({
                height: '-=' + height + 'px'
            }, 500);
        }

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
        return {'background-color': groupColors[id]}
    }

    $scope.noMoreGroups = addedCourses.data.length > 3 ? true : false;

    // make existing elective groups visible, wait for dom elements to load
    angular.element(document).ready(function() {
        $timeout(function() {
            $('.elective-group').each(function(index, element) {
                console.log('elective grouo');
                $(this).css('display', 'inline');
            });
        }, 100);
    });

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

        addedCourses.updateLocalStorage();

        // fade it in after it appears in the dom
        $timeout(function() {
            $newGroup = $('.elective-group:last').fadeIn('slow');
        }, 100);
    }

    $scope.deleteGroup = function(e, group) {
        var $group = $(e.target.parentElement.parentElement.parentElement);
        console.log($group.height());
        $group.animate({
            height: '0px'
        }, 500);
        // don't delete until it's done animating to zero height
        $timeout(function() {
            addedCourses.deleteGroup(group);
            if (addedCourses.data.length <= 3) {
                $scope.noMoreGroups = false;
            }

            addedCourses.updateLocalStorage();
        }, 500);
    }

    $scope.renameGroup = function(group) {
        $modal.open({
            templateUrl: 'renameGroupModal.html',
            controller: 'renameGroupModalCtrl',
            resolve: {
                addedGroup: function() {
                    return group;
                }
            }
        });
        addedCourses.updateLocalStorage();
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
        var $droppedGroup = $(e.target);
        
        // only if dropped in different group
        if ($droppedGroup.context.innerText !== $draggedGroup.context.innerText) {
            // shrink dragged group
            if (draggedGroup.courses.length !== 1) {
                $draggedGroup.animate({
                    height: '-=' + height + 'px'
                }, 500);
            }

            // expand dropped group (not core, handled from the watcher)
            if (droppedGroup.courses.length !== 0 && droppedGroup.id !== 'core') {
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