winstonApp.factory('currentTerm', ['localStorageService', function(localStorageService) {
	var currentTerm = {};

	currentTerm = localStorageService.get('currentTerm') || { 
        'name': 'Fall 2016',
        'termId': '1570'
    };

	return currentTerm;
}]);