// Schedule Controller
//
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', '$location', 'ScheduleObject', 'uiCalendarConfig', '$timeout', function($scope, $window, $rootScope, scheduleFactory, $location, ScheduleObject, uiCalendarConfig, $timeout) {

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

    $scope.refresh = true;

    // The big chunk of data
    var arrayOfArrays = ScheduleObject.getData();

     // Bounds
    $scope.scheduleLength = arrayOfArrays.length;
    $scope.scheduleIndex = 0;

    // EventSources array
    $scope.eventSources = [arrayOfArrays[$scope.scheduleIndex]];

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

        uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');

        $scope.events = arrayOfArrays[$scope.scheduleIndex];

        uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);

    };

    // Click on "Add more courses" button from schedule view
    $scope.showAccordion = function () {
        // switch to accordion view
        $location.path('/find-courses');
    }


    /*
    ****************
    Helper functions
    ****************
     */

    function disableGenerateSchedules() {
        // Disable
        document.getElementById('generate-button').disabled = true;
    }

    function enableGenerateSchedules() {
        // Enable
        document.getElementById('generate-button').disabled = false;
    }

    function clearEvents() {
        // Clear current events
        while ($scope.events.length > 0) {
            $scope.events.pop();
        }
    }

}]);
