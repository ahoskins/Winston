winstonApp.factory('currentTerm', ['localStorageService', function(localStorageService) {
	var currentTerm = {};

	currentTerm = localStorageService.get('currentTerm') || { 
        'name': 'Fall 2015',
        'termId': '1530'
    };

	return currentTerm;
}]);