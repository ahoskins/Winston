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
     /*
    THE VERSION ON BOWER IS DATED!!! MY VERSION OF CALENDAR.JS IS STRAIGHT FROM THE REPO.  MAKE SURE ROSS DOES THIS TOO.
    APPARENTLY BOWER WILL GET UPDATE WITH THE CORRECT VERSION SOON.
     */

     // The problem is that this is being init before the events are set. So the solution to is to re-init it each time the events change

    // The big chunk of data
    var arrayOfArrays = ScheduleObject.getData();

     // Bounds
    $scope.scheduleLength = arrayOfArrays.length;
    $scope.scheduleIndex = 0;


    //$scope.events = arrayOfArrays[$scope.scheduleIndex];

    // EventSources array
    $scope.eventSources = [arrayOfArrays[$scope.scheduleIndex]];
    // console.dir($scope.eventSources);



    //console.log($scope.eventSources);


    // Watch for it to change, then progress with this script
    // $scope.$watch('uiCalendarConfig', function() {
    //     var string = JSON.stringify(uiCalendarConfig);
    //     console.log(string);
    // });

    // console.log(uiCalendarConfig);
    // uiCalendarConfig.calendars[0].fullCalendar('render');

    // When click on "Add more courses" button from schedule view
    $scope.showAccordion = function () {
        // switch to accordion view
        $location.path('/find-courses');
    }



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

        //$scope.events = arrayOfArrays[$scope.scheduleIndex];
        //console.log($scope.events);

        // This is needed or else $scope.eventSources is not getting updated...stupid me
        // So how it is now, event sources is correctly changing each time
        //$scope.eventSources = null;

        uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');

        //$scope.eventSources = [arrayOfArrays[$scope.scheduleIndex]];
        $scope.events = arrayOfArrays[$scope.scheduleIndex];
        // var string = JSON.stringify($scope.eventSources);
        // console.log(string);

        uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);

    };


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
