winstonApp.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', '$window', 'currentTerm', function($scope, $location, $interval, ngProgressLite, addedCourses, $window, currentTerm) {

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

    $scope.electiveGroups = [];

    $scope.newElectiveGroup = function() {
        $scope.electiveGroups.push([]);
        // $scope.electiveGroup[currentTerm.termId].push('hey');
    }

}]);