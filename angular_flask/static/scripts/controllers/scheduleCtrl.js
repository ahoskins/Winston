// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', function($scope, $window, $rootScope, scheduleFactory) {
    // Event array
    $scope.events = [
        //{title: 'All Day Event',start: new Date('Tue Nov 11 2014 09:00:00 MDT'),end: new Date('Tue Nov 11 2014 10:00:00 MDT')}
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

    // Schedule object
    var scheduleListing;

    var renderSchedule = function () {

        scheduleListing.objects[0].sections.forEach(function (classtime) {

            // Time //
            var startTimeString;
            var hour;
            var minute;
            if (classtime.startTime.match(/PM/)) {
                // PM
                startTimeString = classtime.startTime.match(/(\d+):(\d+)/);
                hour = parseInt(startTimeString[1] + 12);
                minute = parseInt(startTimeString[2]);
                // use startTimeString[0] and startTimeString[1] for hour and minute, respectively
            }
            else {
                // AM
                startTimeString = classtime.startTime.match(/(\d+):(\d+)/);
                hour = parseInt(startTimeString[1]);
                minute = parseInt(startTimeString[2]);
            }

            //// Day //
            //var date = new Date();
            //var d;
            //var m = date.getMonth();
            //var y = date.getFullYear();
            //
            //if (classtime.day.match(/TR/)) {
            //    // Tuesday and Thursday
            //    $scope.events.push({
            //        title: classtime.asString,
            //        start: new Date(y,m,d, hour, minute),
            //        end: new Date(y,m,d,hour,minute)
            //    });
            //}


        });


        //$scope.events.push({
        //    title: scheduleListing.objects[0].sections[0].asString,
        //    start: new Date(y,m,d,,0),
        //    end: new Date(y,m,d,18,0)
        //});


    };

    $scope.getSchedules = function () {
        scheduleFactory.getSchedules($rootScope.addedCourses).
        success(function (data) {
            scheduleListing = angular.fromJson(data);

            // Do we have the response??? Yes, we do.
            $window.alert(scheduleListing.objects[0].sections[0].asString);

            renderSchedule();
        }).
        error(function() {
               $window.alert("error dude");
            });
    };

    // This is not needed, but may be needed in the future
    //
    //$('cal').fullCalendar('refetchEvents');


}]);
