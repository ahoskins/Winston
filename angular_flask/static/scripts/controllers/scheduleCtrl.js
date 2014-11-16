// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', function($scope, $window, $rootScope, scheduleFactory) {

    // Full Calendar Config ////////////////////////////
    ////////////////////////////////////////////////////
    //
    // Event array
    $scope.events = [ ];

    // EventSources array
    $scope.eventSources = [$scope.events];

    // General calendar config
    // Note: It is displaying the current week (with the day number hidden)
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

    // Get Schedules /////////////////////////////////
    //////////////////////////////////////////////////
    //

    var scheduleInstance,
        scheduleLength,
        scheduleIndex = 0;

    // Event handle for gen-sched button
    //
    $scope.getSchedules = function () {
        scheduleFactory.getSchedules($rootScope.addedCourses).
            success(function (data) {
                var scheduleListing = angular.fromJson(data);

                // Create closure with current scheduleListing
                scheduleInstance = renderSchedule(scheduleListing);

                // Invoke the closure
                scheduleInstance(0);
            }).
            error(function() {
                $window.alert("error dude");
            });
    };

    // Event handle for prev/next buttons
    //
    $scope.displayDifferentSchedule = function (forward) {

        // Adjust schedule index
        if (forward) {
            scheduleIndex = scheduleIndex + 1;
            if (scheduleIndex >= scheduleLength) {
                scheduleIndex = scheduleLength - 1;
            }
        }
        else {
            scheduleIndex = scheduleIndex - 1;
            if (scheduleIndex < 0) {
                scheduleIndex = 0;
            }
        }

        // Clear current events
        while ($scope.events.length > 0) {
            $scope.events.pop();
        }

        // Invoke the closure on the new index
        scheduleInstance(scheduleIndex);
    };

    // Event handle for clear button
    $scope.clearAdded = function () {
        $rootScope.addedCourses = [];
        $rootScope.shoppingCartSize = 0;
    };

    // @callee: $scope.getSchedules
    //
    // @returns: updated $scope.events
    var renderSchedule = function (scheduleListing) {

        scheduleLength = scheduleListing.objects.length;

        // Return closure of scheduleListing
        //
        // @param {int}: schedule index within the JSON response
        //
        // @return {void}: updates $scope.events
        return function (i) {

            scheduleListing.objects[i].sections.forEach(function (classtime) {

                // Null check
                //
                // TODO: Maybe want to flag the skipped class
                if (classtime.startTime === null ||
                    classtime.endTime === null   ||
                    classtime.day === null         ) {
                    return;
                }

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
                if (classtime.startTime.match(/PM/) && startTimeString[1] != 12) {
                    // PM
                    startHour = parseInt(startTimeString[1]) + 12;
                }
                else {
                    // AM
                    startHour = parseInt(startTimeString[1]);
                }

                var endHour;
                if (classtime.endTime.match(/PM/) && endTimeString[1] != 12) {
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
    };
}]);
