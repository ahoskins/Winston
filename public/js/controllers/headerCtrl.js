/*
The only purpose of this controller is to route the about button
*/

winstonControllers.controller('headerCtrl', ['$scope', '$location', '$modal', 'SubjectBin', '$window', function($scope, $location, $modal, SubjectBin, $window) {

	SubjectBin.populate();

	$scope.open = function() {
		var modalInstance = $modal.open({
	  		templateUrl: 'addedModal.html',
	  		controller: 'modalInstanceCtrl'
		});
	}

	$scope.showAdded = true;

	$scope.$watch(function() {
		return $location.path();
	}, function() {
		if ($location.path() == '/schedule') {
			$scope.showAdded = false;
		} else {
			$scope.showAdded = true;
		}
	});

}]);