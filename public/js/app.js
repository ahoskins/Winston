// Module
//
var winstonApp = angular.module('winstonApp', ['winstonControllers', 'LocalStorageModule', 'ui.calendar', 'pmkr.filterStabilize', 'ui.bootstrap', 'ngRoute', 'ngProgressLite', 'ngAnimate', 'ngMaterial', 'djds4rce.angular-socialshare', 'ui.keypress']);

var winstonControllers = angular.module('winstonControllers', ['ui.calendar']);

winstonApp.config(['$routeProvider', function($routeProvider) {

	$routeProvider.
	  when('/browse', {
	  	templateUrl: 'partials/browse.jade',
	  	resolve: {
	  		courseData: function(courseDataMaker) {
	  			return courseDataMaker.getCoursesDataPromise();
	  		}
	  	}
	  }).
	  when('/schedule', {
	  	templateUrl: 'partials/schedule.jade',
	  	controller: 'scheduleCtrl',
	  	resolve: {
	  		theData: function(readyMadeSchedules) {
	  			return readyMadeSchedules.getSchedulesPromise();
	  		}
	  	}
	  }).
	  otherwise({
	  	redirectTo: '/browse'
	  });

}]);

winstonApp.run(function($FB) {
	$FB.init('1605906902964485');
});

