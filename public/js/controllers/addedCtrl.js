winstonApp.controller('addedCtrl', ['$scope', '$document', '$modalStack', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', '$timeout', '$modal', function($scope, $document, $modalStack, $location, $interval, ngProgressLite, addedCourses, $window, $timeout, $modal) {

    $scope.added = addedCourses.data;

    var denoteHandled = function() {
        handled = true;
        $timeout(function() {
            handled = false;
        }, 500);
    }

    /*
    handle adding courses to core group (either from drop of from accordion)
    only handle events from accordion
    ALL other events must set flag to true to denote they're handled
    */
    $scope.$watch('added', function(newC, oldC) {
        /*
        the other controller, addedDialogCtrl will still cause these watch events to run
        - make sure new groups appear, and don't double handle drags
        */
        $timeout(function() {
            $newGroup = $('.elective-group:last').fadeIn('slow');
        }, 100);
        // will get undefined if in wide view
        if ($modalStack.getTop() != null) return;


        // denotes the event handled in drop handler or elsewhere
        if (handled) return;

        if (height === null || height < 0) {
            height = $('.list-group-item.course:last').height();
        }

        if (newC[0].courses.length > oldC[0].courses.length && newC[0].courses.length !== 1) {
            var $coreGroup = $('#core-group-container');
            console.log($coreGroup);
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
            if (height === null || height < 0) {
                height = $('.list-group-item.course:last').height();
            }
            console.log(height);
            $parentGroup.animate({
                height: '-=' + height + 'px'
            }, 500);
            $timeout(function() {
                addedCourses.remove(course);
                addedCourses.updateLocalStorage();
            }, 500);
        } else {
            addedCourses.remove(course);
            addedCourses.updateLocalStorage();
        }

        denoteHandled();
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
            height = $('.list-group-item.course:last').height();
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

        denoteHandled();
    }

    $scope.deleteGroup = function(e, group) {
        var $group = $(e.target.parentElement.parentElement.parentElement);
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

        denoteHandled();
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
    var handled = false;
    $scope.onDrag = function(e, ui, course, group) {
        draggedCourse = course;
        $draggedGroup = $(ui.helper.context.parentElement);
        draggedGroup = group;
        if (height === null || height < 0) {
            height = e.currentTarget.clientHeight;
        }
    }

    $scope.onDrop = function(e, ui, droppedGroup) {
        denoteHandled();

        var $droppedGroup = $(e.target);

        if (height === null || height < 0) {
            height = $('.list-group-item.course:last').height();
        }

        // only if dropped in different group
        if ($droppedGroup.context.innerText !== $draggedGroup.context.innerText) {
            // shrink dragged group
            if (draggedGroup.courses.length !== 1) {
                $draggedGroup.animate({
                    height: '-=' + height + 'px'
                }, 500);
            }

            // expand dropped group (not core, handled from the watcher)
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