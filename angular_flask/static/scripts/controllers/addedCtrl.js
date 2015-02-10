winstonControllers.controller('addedCtrl', ['$scope', '$location', 'addedCourses', 'SubjectBin', function($scope, $location, addedCourses, SubjectBin){
    
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

    $scope.onDrop = function(e) {
        // Send a broadcast asking for the info for the id
        var courseId = e.toElement.offsetParent.id;
        var courseObj = SubjectBin.searchById(courseId);

        updateAddedCourses(courseObj);
    }

    $scope.added = [];
    var updateAddedCourses = function(courseObj) {
        $scope.added.push(courseObj);
    }

}]);