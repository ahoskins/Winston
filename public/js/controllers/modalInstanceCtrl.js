winstonControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'addedCourses', '$window', '$location', function($scope, $modalInstance, addedCourses, $window, $location){
	
	$scope.added = addedCourses.data;

	$scope.viewSchedules = function() {
		$location.path('/schedule');
		$modalInstance.dismiss();
	}

	$scope.emptyAll = function() {
        addedCourses.data.length = 0;
    }

    $scope.emptyCourse = function(course) {
        var index = addedCourses.data.indexOf(course);
        addedCourses.data.splice(index, 1);
        addedCourses.courseAdded[course.asString] = 0;
    }

}]);