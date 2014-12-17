winstonControllers.controller('addedCtrl', ['$scope', '$location', 'addedCourses', function($scope, $location, addedCourses){
    
    // Mirror the addedCourses service
    $scope.added = addedCourses.data;

	// Event handle for clearing single course
    $scope.removeFromSchedule = function(course) {
        var index = addedCourses.data.indexOf(course);
        if (index > -1) {
            addedCourses.data.splice(index, 1);
        }
    };

    // Event handle for clearing ALL courses
    $scope.removeAll = function() {
        addedCourses.data = [];
    }

}]);