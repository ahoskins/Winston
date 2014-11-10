// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', function($scope, $window, $rootScope, scheduleFactory) {
    // Event array
    $scope.events = [
        {title: 'All Day Event',start: new Date('Tue Nov 11 2014 09:00:00 MDT'),end: new Date('Tue Nov 11 2014 10:00:00 MDT')}
    ];

    // EventSources (required as binding to angular HTML directive)
    $scope.eventSources = [$scope.events];

    // General calendar config
    // Nov 10 -14 is displaying...this is the current week
    $scope.uiConfig = {
        calendar: {
            height: 1000,
            //editable: true,
            header: false,

            // Format
            defaultView: 'agendaWeek',
            columnFormat: "dddd",
            hiddenDays: [0,6],
            minTime: '08:00:00',
            maxTime: '21:00:00',
            allDaySlot: false,

            // Event settings
            allDayDefault: false
            //timezoneParam: 'local'
        }
    };

    var scheduleListing;

    $scope.getSchedules = function () {
        scheduleFactory.getSchedules($rootScope.addedCourses).
        success(function (data) {
            scheduleListing = angular.fromJson(data);

            // Do we have the response??? Yes, we do.
            $window.alert(scheduleListing.objects[0].sections[0].asString);
        }).
        error(function() {
               $window.alert("error dude");
            });
    };


}]);
