/**
Call the API /generate-schedules
 */
winstonApp.factory('scheduleFactory', ['$window', '$http', '$q', 'currentTerm', function ($window, $http, $q, currentTerm) {
    var factory = {};

    factory.getSchedules = function (addedCourses, busyTimes, preferencesArray) {

        var mandatoryCourses = [];
        addedCourses[0].courses.forEach(function (courseObject) {
            mandatoryCourses.push(courseObject.course);
        });

        var electives = [];
        addedCourses.slice(1).forEach(function(electiveGroup) {
            var courseIds = [];
            electiveGroup.courses.forEach(function(courseObject) {
                courseIds.push(courseObject.course);
            });

            if (courseIds.length !== 0) {
                electives.push({
                    courses: courseIds
                });
            }
        });

        var requestParams = {};
        requestParams["institution"] = "ualberta";
        requestParams["term"] = currentTerm.termId;
        requestParams["courses"] = mandatoryCourses;
        requestParams["electives"] = electives;

        if (typeof busyTimes !== 'undefined') {
            requestParams["busy-times"] = busyTimes;
        }

        if (typeof preferencesArray !== 'undefined') {
            var obj = {};
            obj["start-early"] = preferencesArray[0];
            obj["no-marathons"] = - preferencesArray[1];
            obj["day-classes"] = - preferencesArray[2];
            
            obj["current-status"] = false;
            obj["obey-status"] = false;

            requestParams["preferences"] = obj;
        }

        console.dir(requestParams);

        // return( $http({method: 'GET', url: 'https://classtime-alpha-000.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams) }) );
        // return ( $http.jsonp('https://classtime.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams)), method: 'GET' );
        return( $http({method: 'GET', url: 'https://classtime-dev.herokuapp.com/api/v1/generate-schedules?q=' + angular.toJson(requestParams) }) );

    };

    return factory;

}]);
