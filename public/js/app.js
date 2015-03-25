// Module
//
var winstonApp = angular.module('winstonApp', ['LocalStorageModule', 'ui.calendar', 'pmkr.filterStabilize', 'ui.bootstrap', 'ngRoute', 'ngProgressLite', 'ngAnimate', 'ngMaterial', 'djds4rce.angular-socialshare', 'angulartics', 'angulartics.google.analytics']);

winstonApp.config(['$routeProvider', function($routeProvider) {

	$routeProvider.
	  when('/browse', {
	  	templateUrl: 'partials/browse.jade',
	  	resolve: {
	  		courseData: ['courseDataMaker', 'courseCache', 'currentTerm', function(courseDataMaker, courseCache, currentTerm) {
	  			if (courseCache.data[currentTerm.termId] != undefined) {
	  				courseDataMaker.treeCourses = courseCache.data[currentTerm.termId];
	  				return null;
	  			} else {
					return courseDataMaker.coursesDataPromise().then(function() {
						return courseDataMaker.getRemainingPromises();
					});
	  			}
	  		}]
	  	}
	  }).
	  when('/schedule', {
	  	templateUrl: 'partials/schedule.jade',
	  	controller: 'scheduleCtrl',
	  	resolve: {
	  		theData: ['readyMadeSchedules', function(readyMadeSchedules) {
	  			return readyMadeSchedules.getSchedulesPromise();
	  		}]
	  	}
	  }).
	  otherwise({
	  	redirectTo: '/browse'
	  });

}]);

winstonApp.run(['$FB', function($FB) {
	$FB.init('1605906902964485');
}]);

