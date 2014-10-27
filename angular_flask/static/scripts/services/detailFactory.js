coreModule.factory('detailFactory', function ($window, $http, $q) {

    var factory = {};

    factory.getDetails = function (num) {

        function pad (str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        }

        var paddedNum = pad(num, 6);

        return( $http({method: 'GET', url: '/api/courses/' + paddedNum}) );
    };

    return factory;
})