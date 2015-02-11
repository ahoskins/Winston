// Module
//
var winstonApp = angular.module('winstonApp', ['ngDragDrop', 'winstonControllers', 'ui.calendar', 'pmkr.filterStabilize', 'ui.bootstrap', 'ngRoute', 'ngMaterial']);

var winstonControllers = angular.module('winstonControllers', ['ui.calendar', 'pmkr.filterStabilize']);

winstonApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	  when('/find-courses', {
	  	templateUrl: '/static/views/find-courses.html',
	  	controller: 'accordionCtrl'
	  }).
	  when('/schedule', {
	  	templateUrl: '/static/views/schedule.html',
	  	controller: 'scheduleCtrl',
	  	resolve: {
	  		theData: function(readyMadeSchedules) {
	  			return readyMadeSchedules.getSchedulesPromise();
	  		}
	  	}
	  }).
	  when('/about', {
	  	templateUrl: '/static/views/about.html',
	  	controller: 'headerCtrl'
	  }).
	  otherwise({
	  	redirectTo: '/find-courses'
	  });
}])

