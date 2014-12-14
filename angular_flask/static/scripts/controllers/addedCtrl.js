winstonControllers.controller('addedCtrl', ['$scope', '$location', 'addedCourses', '$rootScope', function($scope, $location, addedCourses, $rootScope){
    //$rootScope.addedCourses = [];
	// Event handle for clearing single course
    $scope.removeFromSchedule = function(course) {
        var index = addedCourses.data.indexOf(course);
        if (index > -1) {
            addedCourses.data.splice(index, 1);
            $rootScope.added = addedCourses.data;
        }
    };

    $scope.removeAll = function() {
        addedCourses.data = [];
        $rootScope.added = addedCourses.data;
    }

}]);