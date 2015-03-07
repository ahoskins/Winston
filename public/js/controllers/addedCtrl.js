winstonControllers.controller('addedCtrl', ['$scope', '$location', '$interval', 'ngProgressLite', 'addedCourses', 'SubjectBin', '$window', function($scope, $location, $interval, ngProgressLite, addedCourses, SubjectBin, $window){
    
    // Mirror the addedCourses service
    $scope.added = addedCourses.data;

	// Event handle for clearing single course
    // $scope.removeFromSchedule = function(course) {
    //     var index = addedCourses.data.indexOf(course);
    //     if (index > -1) {
    //         addedCourses.data.splice(index, 1);
    //         addedCourses.courseAdded[course.asString] = 0;
    //     }
    // };

    // // Event handle for clearing ALL courses
    // $scope.removeAll = function() {
    //     while (addedCourses.data.length > 0) {
    //         addedCourses.data.pop();
    //     }

    //     for (key in addedCourses.courseAdded) {
    //         delete addedCourses.courseAdded[key];
    //     }
    // }

    $scope.emptyCourse = function(course) {
        var index = addedCourses.data.indexOf(course);
        addedCourses.data.splice(index, 1);
        addedCourses.courseAdded[course.asString] = 0;
    }

    $scope.emptyAll = function() {
        addedCourses.data.length = 0;
    }

    $scope.viewSchedules = function() {
        ngProgressLite.start();
        $location.path('/schedule');
    }
}]);