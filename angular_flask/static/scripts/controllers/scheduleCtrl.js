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

    var renderSchedule = function (scheduleListing) {

        scheduleListing.objects[0].sections.forEach(function (classtime) {

            // Time //
            //
            //
            var startTimeString = classtime.startTime.match(/(\d+):(\d+)/),
                endTimeString = classtime.endTime.match(/(\d+):(\d+)/);

            // Minute
            var startMinute = parseInt(startTimeString[2]),
                endMinute = parseInt(endTimeString[2]);

            // Hour
            var startHour;
            if (classtime.startTime.match(/PM/)) {
                // PM
                startHour = parseInt(startTimeString[1]) + 12;
            }
            else {
                // AM
                startHour = parseInt(startTimeString[1]);
            }

            var endHour;
            if (classtime.endTime.match(/PM/)) {
                // PM
                endHour = parseInt(endTimeString[1]) + 12;
            }
            else {
                // AM
                endHour = parseInt(endTimeString[1]);
            }

            // Day //
            //
            //
            var date = new Date(),
                d = date.getDate(),
                m = date.getMonth(),
                y = date.getFullYear();

            // JavaScript function Date.getDay()
            //
            // Sunday 0
            // Monday 1
            // Tuesday 2
            // Wednesday 3
            // Thursday 4
            // Friday 5
            // Saturday 6
            //
            // @return {int} enumeration of current day of the week
            var dayNumber = date.getDay(),
                offset;


            // Use the current day {int:0:6} of the week
            // Enumerate each day of the week {int:0:6}
            // and find the offset {int:0:6}
            // Use this offset to find calendar day number  {int:0:31}
            if (classtime.day.match(/M/)) {
                offset = 1 - dayNumber;
                addEvent(offset);
            }

            if (classtime.day.match(/T/)) {
                offset = 2 - dayNumber;
                addEvent(offset);
            }

            if (classtime.day.match(/W/)) {
                offset = 3 - dayNumber;
                addEvent(offset);
            }

            if (classtime.day.match(/R/)) {
                offset = 4 - dayNumber;
                addEvent(offset);
            }

            if (classtime.day.match(/F/)) {
                offset = 5 - dayNumber;
                addEvent(offset);
            }

            // Add event using parameters:
            // asString
            // Time
            // Day
            //
            // @returns {void} an event is added to $scope.events array
            function addEvent(offset) {
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
                var scheduleListing = angular.fromJson(data);

                renderSchedule(scheduleListing);
        }).
        error(function() {
               $window.alert("error dude");
            });
    };

}]);
