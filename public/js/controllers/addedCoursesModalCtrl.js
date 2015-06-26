winstonApp.controller('addedCoursesModalCtrl', ['$scope', '$modalInstance', 'addedCourses', '$window', '$location', 'ngProgressLite', 'currentTerm', function($scope, $modalInstance, addedCourses, $window, $location, ngProgressLite, currentTerm) {

	// TODO: use the addedCtrl here instead

	$scope.added = addedCourses.data;
	$scope.currentTerm = currentTerm;

	$scope.viewSchedules = function() {
		$location.path('/schedule');
		ngProgressLite.start();
		$modalInstance.dismiss();
	}

	$scope.emptyAll = function() {
        addedCourses.data[currentTerm.termId].length = 0;
    }

    $scope.emptyCourse = function(course) {
        var index = addedCourses.data[currentTerm.termId].indexOf(course);
        addedCourses.data[currentTerm.termId].splice(index, 1);
        addedCourses.courseAdded[currentTerm.termId][course.asString] = 0;
    }

}]);