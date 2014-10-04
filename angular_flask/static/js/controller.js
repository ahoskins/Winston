// Controllers
//
var controllers = {};
controllers.CourseList = function($scope, courseFactory) {
	$scope.classes = [];

	function init() {
		$scope.classes = courseFactory.getClasses();
	}

	init();
};

// Collect controllers
//
demoIndex.controller(controllers);
