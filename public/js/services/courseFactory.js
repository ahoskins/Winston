winstonApp.factory('courseFactory', function ($window, $http, $q) {
	
	var factory = {};

	factory.getCoursesPage = function (p) {

		// Return a $http request and the promise associated with it
		return( $http({method: 'GET', url: 'https://classtime.herokuapp.com/api/v1/courses-min?q={"filters":[{"name":"institution","op":"equals","val":"ualberta"},{"name":"term","op":"equals","val":"1490"}]}&page=' + p }) );

	};

    return factory;
});