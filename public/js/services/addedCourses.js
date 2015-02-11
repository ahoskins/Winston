/*
Service to hold addedCourses
Perfect for information sharing between controllers because it is a Singleton
*/
winstonApp.factory('addedCourses', function() {
	var factory = {};

	factory.data = [];

	factory.courseAdded = {};

	return factory;
});