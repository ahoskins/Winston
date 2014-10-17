coreModule.factory('courseFactory', function ($window, $http, $q) {
	
	var factory = {};

	factory.getCoursesPage = function (p) {
		// Return a $http request and the promise associated with it
		return( $http({method: 'GET', url: '/api/terms/1490/courses?page=' + p }) );

	};

    return factory;
});