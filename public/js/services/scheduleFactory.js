/**
Call the API /generate-schedules
 */
winstonApp.factory('scheduleFactory', function ($window, $http, $q) {
    var factory = {};

    factory.getSchedules = function (addedCourses) {

        var courseIds = [];
        addedCourses.forEach(function (courseObject) {
            courseIds.push(courseObject.course);
        });

        //$window.alert(addedCourses[0]);
        var requestParams = {};
        requestParams["institution"] = "ualberta";
        requestParams["term"] = "1490";
        requestParams["courses"] = courseIds;

        // return( $http({method: 'GET', url: 'https://classtime-alpha-000.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams) }) );
        return ( $http.jsonp('https://classtime-alpha-000.herokuapp.com/api/generate-schedules?q=' + angular.toJson(requestParams)), method: 'GET' );

    };

    return factory;

});
