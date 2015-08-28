winstonApp.controller('renameGroupModalCtrl', ['$scope', '$modalInstance', 'addedGroup', 'addedCourses', function($scope, $modalInstance, addedGroup, addedCourses) {

	$scope.name = '';

	$scope.save = function() {
		addedGroup.name = $scope.name;
		addedCourses.updateLocalStorage();
		$modalInstance.dismiss();
	}

	$scope.cancel = function() {
		$modalInstance.dismiss();
	}

}]);