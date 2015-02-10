/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', 'scheduleFactory', '$location', 'readyMadeSchedules', 'uiCalendarConfig', '$timeout', 'SubjectBin', function($scope, $window, scheduleFactory, $location, readyMadeSchedules, uiCalendarConfig, $timeout, SubjectBin) {


    /**
    Drag and drop
    */
    // $scope.onDrop = function(e) {
    //     // Send a broadcast asking for the info for the id
    //     var courseId = e.toElement.offsetParent.id;
    //     var courseObj = SubjectBin.searchById(courseId);

    //     updateAddedCourses(courseObj);
    // }

    // $scope.added = [];
    // var updateAddedCourses = function(courseObj) {
    //     $scope.added.push(courseObj);
    // }


    /* 
    ********************
    Full Calendar Config
    ********************
     */

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



    /*
    *********************
    Use the readyMadeSchedules service to get the schedule data
    Put this data into $scope.eventSources
    *********************
    */

    // Array of ready to go schedules in Full Calendar format
    // var arrayOfArrays = readyMadeSchedules.getReadyMadeSchedules();

    //  // Schedule bounds based on length
    // $scope.scheduleLength = arrayOfArrays.length;
    // $scope.scheduleIndex = 0;

    // // Put the data into the eventSources array
    // $scope.eventSources = [arrayOfArrays[$scope.scheduleIndex]];

    /*
    ***********************
    Handle clicks on buttons
    ***********************
    */

    // Event handle for prev/next buttons
    $scope.displayDifferentSchedule = function (forward) {

        // Adjust schedule index
        if (forward) {
            $scope.scheduleIndex = $scope.scheduleIndex + 1;
            if ($scope.scheduleIndex >= $scope.scheduleLength) {
                $scope.scheduleIndex = $scope.scheduleIndex - 1;
            }
        }
        else {
            $scope.scheduleIndex = $scope.scheduleIndex - 1;
            if ($scope.scheduleIndex < 0) {
                $scope.scheduleIndex = 0;
            }
        }

        $scope.events = arrayOfArrays[$scope.scheduleIndex];

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
