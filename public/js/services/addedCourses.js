/*
Service to hold addedCourses
Perfect for information sharing between controllers because it is a Singleton
*/
winstonApp.factory('addedCourses', function(localStorageService) {
	var factory = {};

	factory.data = localStorageService.get('addedCourses.data') || [];

	factory.courseAdded = localStorageService.get('addedCourses.courseAdded') || {};

	return factory;
});