/**
 * Created by Andrew on 14-11-09.
 */
coreModule.factory('scheduleFactory', function ($window, $http, $q) {
    var factory = {};

    factory.getSchedules = function (addedCourses) {

        var requestParams = {};
        requestParams["term"] = 1490;
        requestParams["busy-times"] = [];
        for (courseObj in addedCourses) {
            requestParams["courses"].push(courseObj.course);
        }




        return( $http({method: 'GET', url: '/api/generate-schedules?q=' + requestParams }) );

    };

    return factory;

});
