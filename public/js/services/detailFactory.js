winstonApp.factory('detailFactory', function ($window, $http, $q) {

    var factory = {};

    // Generic string padding function
    // @returns {String} padded string
    function pad (str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    // Called by fastCourseListCtrl.js on click of course
    // @returns {Promise} with .success and .error
    factory.getDetails = function (num) {
        // Pad course number to 6 characters
        var paddedNum = pad(num, 6);

        return( $http({method: 'GET', url: 'https://classtime-alpha-000.herokuapp.com/api/courses/' + paddedNum}) );
    };

    return factory;
})