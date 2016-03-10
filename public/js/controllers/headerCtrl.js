/*
The only purpose of this controller is to route the about button
*/

winstonApp.controller('headerCtrl', ['$scope', '$location', '$modal', '$window', function($scope, $location, $modal, $window) {

	$scope.open = function() {
		var modalInstance = $modal.open({
	  		templateUrl: 'addedCoursesModal.html',
	  		controller: 'addedCtrl'
		});
	}

	$scope.back = function() {
		$location.path('/browse');
	}

	$scope.showAdded = true;
	$scope.showBackToBrowse = false;

	$scope.$watch(function() {
		return $location.path();
	}, function() {
		if ($location.path() == '/schedule') {
			$scope.showAdded = false;
			$scope.showBackToBrowse = true;
		} else {
			$scope.showAdded = true;
			$scope.showBackToBrowse = false;
		}
	});

}]);