winstonControllers.controller('headerCtrl', ['$scope', '$location', function($scope, $location) {

	$scope.showAbout = function() {
		$location.path('/about');
	}

	$scope.goBack = function() {
		$location.path('/find-courses');
	}

}])