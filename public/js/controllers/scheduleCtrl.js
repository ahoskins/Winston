/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', '$location', 'uiCalendarConfig', '$timeout', 'SubjectBin', 'readyMadeSchedules', function($scope, $window, $location, uiCalendarConfig, $timeout, SubjectBin, readyMadeSchedules) {

    /* 
    ***************************************
    Full Calendar Config
    ***************************************
     */

    // Note: It is displaying the current week (with the day number hidden)
    $scope.uiConfig = {
        calendar: {
            height: 1000,
            //editable: true,
            header: false,

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
    ******************************************************
    Get the schedule data from readyMadeSchedules service
    ******************************************************
    */

    // Array of ready to go schedules in Full Calendar format
    var arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

    var schedules = JSON.stringify(arrayOfSchedules);
    console.log(schedules);

    $scope.scheduleLength = arrayOfSchedules.length;
    $scope.scheduleIndex = 0;

    // eventSources is a single, complete schedule
    $scope.eventSources = [arrayOfSchedules[0]];

    /*
    ***********************
    Handle clicks on buttons
    ***********************
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

    // // Event hanlde for add more courses button
    // $scope.showAccordion = function () {
    //     // switch to accordion view
    //     $location.path('/find-courses');
    // }

}]);
