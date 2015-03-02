winstonControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'addedCourses', '$window', '$location', function($scope, $modalInstance, addedCourses, $window, $location){
	
	$scope.added = addedCourses.data;

	$scope.viewSchedules = function() {
		$location.path('/schedule');
		$modalInstance.dismiss();
	}

	$scope.emptyAll = function() {
        addedCourses.data.length = 0;
    }

}]);