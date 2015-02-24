winstonControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'addedCourses', '$window', function($scope, $modalInstance, addedCourses, $window){
	
	$scope.added = addedCourses.data;

	$window.alert($scope.added.length);

	$scope.cancel = function() {
		$modalInstance.dismiss()
	}

	$scope.ok = function() {
		$modalInstance.dismiss()
	}

}]);