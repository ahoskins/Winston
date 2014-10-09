// Controllers
//
var controllers = {};

controllers.CourseList = function ($scope, $window, courseFactory) {
	$scope.classes = [];

	// This will run on page load
	// The return on the getClasses method is a "promise" (as they say in the JavaScripts)
	// This "promise" will result in the success method being called if everything worker
	// At this point, we de-serialize and bind this object to $scope.classes
	//
	function init() {
		courseFactory.getClasses().
			success(function (data, status, headers, config) {
				courseListing = angular.fromJson(data);
				$scope.classes = courseListing.objects;
			}) 
	}

	// $scope.doGreeting = function(greeting) {
	// 	$window.alert();
	// }

	//$window.alert("test alert");

	init();
};

// Collect controllers
//
demoIndex.controller(controllers);
