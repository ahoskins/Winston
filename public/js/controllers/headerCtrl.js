/*
The only purpose of this controller is to route the about button
*/

winstonControllers.controller('headerCtrl', ['$scope', '$location', '$modal', 'SubjectBin', '$window', function($scope, $location, $modal, SubjectBin, $window) {

	// $scope.showAbout = function() {
	// 	$location.path('/about');
	// }

	// $scope.goBack = function() {
	// 	$location.path('/find-courses');
	// }
	    $.material.init();

	// $scope.atTop = false;
	SubjectBin.populate();

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'addedModal.html',
      controller: 'modalInstanceCtrl'
    });
  };

}])