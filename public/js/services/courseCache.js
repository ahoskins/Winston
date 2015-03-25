winstonApp.factory('courseCache', ['localStorageService', function(localStorageService) {
	var factory = {};

	factory.data = localStorageService.get('courseCache.data') || {};

	return factory;
}]);