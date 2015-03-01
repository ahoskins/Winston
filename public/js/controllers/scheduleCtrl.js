/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', '$location', 'uiCalendarConfig', '$timeout', 'SubjectBin', 'readyMadeSchedules', function($scope, $window, $location, uiCalendarConfig, $timeout, SubjectBin, readyMadeSchedules) {

    // click each calendar events causes dialog box with course info

    /*
    ******************************************************
    Get the schedule data from readyMadeSchedules service
    ******************************************************
    */

    // Array of ready to go schedules in Full Calendar format
    var arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

    $scope.scheduleLength = arrayOfSchedules.length;
    $scope.scheduleIndex = 0;

    $scope.events = arrayOfSchedules[0];

    // For some reason, uiCalendarConfig is not populated right when the page loads
    $timeout(function() {
        uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');
        uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);
    }, 500);

    /* 
    ***************************************
    Full Calendar Config
    ***************************************
     */

    // Note: It is displaying the current week (with the day number hidden)
    $scope.uiConfig = {
        calendar: {
            // Use theme and then $UI themeroller if I want
            // editable: true,

            // buttons on events of probably this: http://fullcalendar.io/docs/views/Custom_Views/

            height: 1000,
            header: false,

            selectable: true,
            // selectHelper: true,
            select: function(start, end) {
                $scope.$apply(function(){

                    $scope.events.push({
                        durationEditable: true,
                        title: 'Busy Time',
                        start: start,
                        end: end,
                        color: '#EF9A9A'
                    });

                    uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');
                    uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);
                });
            },
            eventClick: function(calEvent, jsEvent, view) {
                // Only allowed to delete busy times
                if (calEvent.title !== 'Busy Time') {
                    return;
                }

                // Delete the event
                var index = $scope.events.indexOf(calEvent);
                $scope.$apply(function() {
                    $scope.events.splice(index, 1);

                    uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');
                    uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);
                });
            },

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

    /*
    ****************************************
    Handle clicks on toggle schedule button
    ****************************************
    */

    // Event handle for prev/next buttons
    $scope.displayDifferentSchedule = function (forward) {

        // Adjust schedule index
        if (forward) {
            if ($scope.scheduleIndex == $scope.scheduleLength - 1) {
                return;
            }
            $scope.scheduleIndex ++;
        }
        else {
            if ($scope.scheduleIndex == 0) {
                return;
            }
            $scope.scheduleIndex --;
        }

        $scope.events = arrayOfSchedules[$scope.scheduleIndex];

        /*
        Full Calendar is very finicky and sometimes won't render the new events
        For this reason, clear all the events first, then add the new events to the fresh event sources
        */
        uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');
        uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);
    };

    $scope.backToBrowse = function() {
        $location.path('/browse');
    }

}]);
