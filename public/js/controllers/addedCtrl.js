winstonApp.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', 'currentTerm', function($scope, $location, $interval, ngProgressLite, addedCourses, $window, currentTerm) {

    // Merge added with electiveGroups to form one big glob of added...and hold these in localStorage

    $scope.added = addedCourses.data;
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
        this.name = name;
        this.courses = [];
    }

    var count = 0;
    $scope.newElectiveGroup = function() {
        $scope.electiveGroups.push(new ElectiveGroup(count ++));
    }

    var draggedCourse = null;
    $scope.onDrag = function(e, ui, course) {
        console.dir(course);
        draggedCourse = course;
    }

    $scope.onDrop = function(e, ui, group) {
        // find the elective group and push on the draggedCourse
        $scope.electiveGroups.forEach(function(electiveGroup) {
            if (electiveGroup.name === group.name) {
                electiveGroup.courses.push(draggedCourse);
            }
        });

        // remove from where it came from
        $scope.added[currentTerm.termId].forEach(function(course) {
            if (course === draggedCourse) {
                delete $scope.added[currentTerm.termId][$scope.added[currentTerm.termId].indexOf(course)];
            }
        });
    }

}]);