/*
Service to hold addedCourses
Perfect for information sharing between controllers because it is a Singleton
*/
winstonApp.factory('addedCourses', ['localStorageService', function(localStorageService) {
	var factory = {};

	factory.data = localStorageService.get('addedCourses.data') || {};

	factory.courseAdded = localStorageService.get('addedCourses.courseAdded') || {};

	return factory;
}]);

/**
addedCourses = {
	core:  [<courses>],
	electives: [{
		id: 1,
		courses: []
	}]
}

addedCourses = [{
	id: core,
	courses: []
},
{
	id: 1,
	courses: []
},
{
	id: 2,
	courses: []
}]

*/