// Module
//
var winstonApp = angular.module('winstonApp', ['winstonControllers', 'ui.calendar', 'pmkr.filterStabilize', 'ui.bootstrap', 'ngRoute']);

var winstonControllers = angular.module('winstonControllers', ['ui.calendar', 'pmkr.filterStabilize']);

winstonApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	  when('/browse', {
	  	templateUrl: 'partials/browse.jade'
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
}])

