/**
 * Created by Andrew on 14-11-09.
 */
coreModule.factory('scheduleFactory', function ($window, $http, $q) {
    var factory = {};

    factory.getSchedules = function (addedCourses) {
        // It gets here...hone this out to make the api call work

        // added courses is an array of course objects
        // I only want to use the "course" property of these in the api call
        var courseIds = [];
        addedCourses.forEach(function (courseObject) {
            courseIds.push(courseObject.course);
        });

        //$window.alert(addedCourses[0]);
        var requestParams = {};
        requestParams["institution"] = "ualberta";
        requestParams["term"] = "1490";
        requestParams["courses"] = courseIds;

        return( $http({method: 'GET', url: '/api/generate-schedules?q=' + angular.toJson(requestParams) }) );

    };

    return factory;

});
