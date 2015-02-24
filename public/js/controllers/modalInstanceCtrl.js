winstonControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'addedCourses', function($scope, $modalInstance, addedCourses){
	$scope.cancel = function() {
		$modalInstance.dismiss()
	}

	$scope.ok = function() {
		$modalInstance.dismiss()
	}

	$scope.added = addedCourses.data;

}]);