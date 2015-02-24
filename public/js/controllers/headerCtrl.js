/*
The only purpose of this controller is to route the about button
*/

winstonControllers.controller('headerCtrl', ['$scope', '$location', '$modal', 'SubjectBin', function($scope, $location, $modal, SubjectBin) {

	// $scope.showAbout = function() {
	// 	$location.path('/about');
	// }

	// $scope.goBack = function() {
	// 	$location.path('/find-courses');
	// }

	// $scope.atTop = false;

	SubjectBin.populate();

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'addedModal.html',
      controller: 'modalInstanceCtrl'
    });
  };

}])