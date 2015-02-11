/*
The only purpose of this controller is to route the about button
*/

winstonControllers.controller('headerCtrl', ['$scope', '$location', function($scope, $location) {

	$scope.showAbout = function() {
		$location.path('/about');
	}

	$scope.goBack = function() {
		$location.path('/find-courses');
	}

	$scope.atTop = false;

}])