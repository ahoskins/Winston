winstonControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'addedCourses', '$window', function($scope, $modalInstance, addedCourses, $window){
	
	$scope.added = addedCourses.data;

	$scope.cancel = function() {
		$modalInstance.dismiss()
	}

	$scope.ok = function() {
		$modalInstance.dismiss()
	}

}]);