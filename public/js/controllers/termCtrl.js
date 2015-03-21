
winstonApp.controller('termCtrl', ['$scope', '$window', 'currentTerm', 'localStorageService', function($scope, $window, currentTerm, localStorageService) {

	$scope.availableTerms = [
		{ 
			'name': 'Fall 2014',
			'termId': '1490'
		},
		{ 
			'name': 'Winter 2015',
			'termId': '1500'
		},
		{ 
			'name': 'Spring 2015',
			'termId': '1510'
		},
		{ 
			'name': 'Summer 2015',
			'termId': '1520'
		},
		{ 
			'name': 'Fall 2015',
			'termId': '1530'
		},
		{ 
			'name': 'Winter 2016',
			'termId': '1540'
		}
	];
	$scope.currentTerm = currentTerm;

	$scope.changeTerm = function(term) {
		$scope.currentTerm.name = term.name;
		$scope.currentTerm.termId = term.termId;

		currentTerm = $scope.currentTerm;
		localStorageService.set('currentTerm', currentTerm);
		$window.location.reload();
	}

}]);