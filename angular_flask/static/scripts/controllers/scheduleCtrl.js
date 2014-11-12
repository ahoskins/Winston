// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', function($scope, $window, $rootScope, scheduleFactory) {
    // Event array
    $scope.events = [ ];

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
            var startHour;
            var startMinute;

            if (classtime.startTime.match(/PM/)) {
                // PM
                startTimeString = classtime.startTime.match(/(\d+):(\d+)/);
                startHour = parseInt(startTimeString[1]) + 12;
                startMinute = parseInt(startTimeString[2]);
            }
            else {
                // AM
                startTimeString = classtime.startTime.match(/(\d+):(\d+)/);
                startHour = parseInt(startTimeString[1]);
                startMinute = parseInt(startTimeString[2]);
            }

            var endTimeString;
            var endHour;
            var endMinute;

            if (classtime.endTime.match(/PM/)) {
                // PM
                endTimeString = classtime.endTime.match(/(\d+):(\d+)/);
                endHour = parseInt(endTimeString[1]) + 12;
                endMinute = parseInt(endTimeString[2]);
            }
            else {
                // AM
                endTimeString = classtime.endTime.match(/(\d+):(\d+)/);
                endHour = parseInt(endTimeString[1]);
                endMinute = parseInt(endTimeString[2]);
            }


            // Day //
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            var dayNumber = date.getDay();
            var offset;

            // Sunday 0
            // Monday 1
            // Tuesday 2
            // Wednesday 3
            // Thursday 4
            // Friday 5
            // Saturday 6

            // getDay() returns day of week as number
            // Enumerate the parsed day of the week
            // find the offset between current, and this day
            // this will tell you the day of the week
            //
            if (classtime.day.match(/M/)) {
                offset = 1 - dayNumber;

                $scope.events.push({
                    title: classtime.asString,
                    start: new Date(y,m,d + offset, startHour, startMinute),
                    end: new Date(y,m,d + offset,endHour,endMinute)
                });
            }

            if (classtime.day.match(/T/)) {
                offset = 2 - dayNumber;

                $scope.events.push({
                    title: classtime.asString,
                    start: new Date(y,m,d + offset, startHour, startMinute),
                    end: new Date(y,m,d + offset,endHour,endMinute)
                });
            }

            if (classtime.day.match(/W/)) {
                offset = 3 - dayNumber;

                $scope.events.push({
                    title: classtime.asString,
                    start: new Date(y,m,d + offset, startHour, startMinute),
                    end: new Date(y,m,d + offset,endHour,endMinute)
                });
            }

            if (classtime.day.match(/R/)) {
                offset = 4 - dayNumber;

                $scope.events.push({
                    title: classtime.asString,
                    start: new Date(y,m,d + offset, startHour, startMinute),
                    end: new Date(y,m,d + offset,endHour,endMinute)
                });
            }

            if (classtime.day.match(/F/)) {
                offset = 5 - dayNumber;

                $scope.events.push({
                    title: classtime.asString,
                    start: new Date(y,m,d + offset, startHour, startMinute),
                    end: new Date(y,m,d + offset,endHour,endMinute)
                });
            }


        });

    };

    $scope.getSchedules = function () {
        scheduleFactory.getSchedules($rootScope.addedCourses).
        success(function (data) {
                scheduleListing = angular.fromJson(data);

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
