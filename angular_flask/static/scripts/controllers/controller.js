// Classes Controller
//
coreModule.controller('CourseListCtrl', ['$scope', '$window', 'courseFactory', function($scope, $window, courseFactory) {
	$scope.classes = [];

	courseFactory.getClasses(3).
		success(function (data, status, headers, config) {
			var courseListing = angular.fromJson(data);
			$scope.classes = courseListing.objects;
		}).
		error(function () {
			$window.alert("Something when horribly wrong.");
			return -1;
		});

}]);

