/**
Call the API /generate-schedules
 */
winstonApp.factory('scheduleFactory', function ($window, $http, $q, currentTerm) {
    var factory = {};

    factory.getSchedules = function (addedCourses, busyTimes, preferencesArray) {

        var courseIds = [];
        addedCourses.forEach(function (courseObject) {
            courseIds.push(courseObject.course);
        });

        //$window.alert(addedCourses[0]);
        var requestParams = {};
        requestParams["institution"] = "ualberta";
        requestParams["term"] = currentTerm.termId;
        requestParams["courses"] = courseIds;

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

        // return( $http({method: 'GET', url: 'https://classtime-alpha-000.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams) }) );
        // return ( $http.jsonp('https://classtime.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams)), method: 'GET' );
        return( $http({method: 'GET', url: 'https://classtime.herokuapp.com/api/v1/generate-schedules?q=' + angular.toJson(requestParams) }) );

    };

    return factory;

});
