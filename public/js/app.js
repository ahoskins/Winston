// Module
//
var winstonApp = angular.module('winstonApp', ['winstonControllers', 'LocalStorageModule', 'ui.calendar', 'pmkr.filterStabilize', 'ui.bootstrap', 'ngRoute', 'ngFacebook', 'ngProgressLite', 'ngAnimate', 'ngMaterial', 'djds4rce.angular-socialshare']);

var winstonControllers = angular.module('winstonControllers', ['ui.calendar']);

winstonApp.config(['$routeProvider', '$facebookProvider', function($routeProvider, $facebookProvider) {

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

	$facebookProvider.setAppId('1605906902964485');
}]);

winstonApp.run( function($rootScope) {
  // Load the facebook SDK asynchronously
  (function(){
     // If we've already installed the SDK, we're done
     if (document.getElementById('facebook-jssdk')) {return;}

     // Get the first script element, which we'll use to find the parent node
     var firstScriptElement = document.getElementsByTagName('script')[0];

     // Create a new script element and set its id
     var facebookJS = document.createElement('script'); 
     facebookJS.id = 'facebook-jssdk';

     // Set the new script's source to the source of the Facebook JS SDK
     facebookJS.src = '//connect.facebook.net/en_US/all.js';

     // Insert the Facebook JS SDK into the DOM
     firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
   }());

  window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,"script","twitter-wjs"));

});

