coreModule.factory('fastCourseFactory', function ($window, $http, $q) {
	
	var factory = {};

	factory.getCoursesPage = function (p) {
		// Return a $http request and the promise associated with it
		return( $http({method: 'GET', url: '/api/courses-min?page=' + p }) );

	};

    return factory;
});