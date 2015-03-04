/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', '$location', 'uiCalendarConfig', '$timeout', 'SubjectBin', 'readyMadeSchedules', '$facebook', function($scope, $window, $location, uiCalendarConfig, $timeout, SubjectBin, readyMadeSchedules, $facebook) {

    /*
    ******************************************************
    Get the schedule data from readyMadeSchedules service
    ******************************************************
    */

    // Array of ready to go schedules in Full Calendar format
    var arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

    $scope.scheduleLength = arrayOfSchedules.length;
    $scope.scheduleIndex = 0;

    var coursesTimes;
    var busyTimes = [];

    coursesTimes = arrayOfSchedules[0];
    $scope.events = coursesTimes;

    $timeout(function() {
        refreshCalendar();
        captureCalendarCanvas();
    }, 0);

    /* 
    ***********************************************
    Full Calendar Config
    ***********************************************
     */

    // Note: It is displaying the current week (with the day number hidden)
    $scope.uiConfig = {
        calendar: {
            // Use theme and then $UI themeroller if I want
            // editable: true,

            // buttons on events of probably this: http://fullcalendar.io/docs/views/Custom_Views/

            height: "auto",
            header: false,

            selectable: true,
            // selectHelper: true,

            /**
            On click of empty space on calendar...add as busy time if in "edit busy time" mode
            */
            select: function(start, end) {

                if (!$scope.editableMode) {
                    return;
                }

                busyTimes.push({
                    durationEditable: true,
                    title: 'Busy Time',
                    start: start,
                    end: end,
                    color: '#EF9A9A'
                });

                $scope.events = busyTimes;
                refreshCalendar();
            },

            /**
            On click of event on calendar...delete event if this event is busy time and "edit busy time" mode
            */
            eventClick: function(calEvent, jsEvent, view) {

                // Only allowed to delete busy times
                if (calEvent.title !== 'Busy Time') {
                    return;
                }

                // Delete the event
                var index = busyTimes.indexOf(calEvent);
                busyTimes.splice(index, 1);

                $scope.events = busyTimes.concat(coursesTimes);
                refreshCalendar();
            },

            // eventMouseover to do the tooltip if the other one drives me crazy

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

        coursesTimes = arrayOfSchedules[$scope.scheduleIndex];

        $scope.events = busyTimes.concat(coursesTimes);
        refreshCalendar();
        captureCalendarCanvas();
    };

    $scope.backToBrowse = function() {
        $location.path('/browse');
    }

    var createBusyObject = function(event) {
        var busyObject = {};

        switch(event.start.day()) {
            case 1:
                busyObject.day = 'M';
                break;
            case 2:
                busyObject.day = 'T';
                break;
            case 3:
                busyObject.day = 'W';
                break;
            case 4:
                busyObject.day = 'R';
                break;
            case 5:
                busyObject.day = 'F';
                break;
        }


        // Start
        var hour = event.start.hour();
        var side = 'AM';
        if (hour > 12) {
            hour = hour - 12;
            side = 'PM';
        } 
        hour = ("0" + hour).slice(-2); 

        var minute = event.start.minute();
        minute = ("0" + minute).slice(-2);

        busyObject.startTime = hour + ':' + minute + ' ' + side;


        // End
        var hour = event.end.hour();
        var side = 'AM';
        if (hour > 12) {
            hour = hour - 12;
            side = 'PM';
        }  
        hour = ("0" + hour).slice(-2);

        var minute = event.end.minute();
        minute = ("0" + minute).slice(-2);

        busyObject.endTime = hour + ':' + minute + ' ' + side;


        return busyObject;
    }

    var generateApiBusyTimes = function() {
        var apiBusyTimes = [];
        busyTimes.forEach(function(event) {
            if (event.title === 'Busy Time') {
                console.dir(event);
                apiBusyTimes.push(createBusyObject(event));
            }
        });

        return apiBusyTimes;
    }

    $scope.busyTimeButtonText = "Add Busy Time";
    $scope.editableMode = false;

    $scope.open = function() {
        $scope.editableMode = !$scope.editableMode;
        if ($scope.editableMode) {

            $scope.busyTimeButtonText = "Done"

            // Allow busy time to be added anywhere
            $scope.events = busyTimes;
            refreshCalendar();

        } else {
            $scope.busyTimeButtonText = "Add Busy Time";

            console.log($scope.events);

            var apiBusyTimes = generateApiBusyTimes();

            console.dir(apiBusyTimes);

            // Regenerate the schedule!
            readyMadeSchedules.getSchedulesPromise(apiBusyTimes).then(function() {
                arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

                $scope.scheduleLength = arrayOfSchedules.length;
                $scope.scheduleIndex = 0;

                coursesTimes = arrayOfSchedules[0];

                $scope.events = busyTimes.concat(coursesTimes);
                refreshCalendar();
            });
        }
    }

    /*
    *********************************
    Facebook integration (open graph)
    *********************************
    */

    $scope.share = function() {
        $facebook.ui(
         {
          method: 'share',
          href: 'thewinston.herokuapp.com/'
        });
    }

    /*
    *********************************************************************
    Open calendar as png in new tab/window (seems to depend on browser)
    *********************************************************************
    */

    $scope.open = function() {
        $window.open(calendarCanvas.toDataURL('image/png'));
    }

    /*
    ************************************
    Utility
    ************************************
    */

    function refreshCalendar() {
        uiCalendarConfig.calendars.weekView.fullCalendar('removeEvents');
        uiCalendarConfig.calendars.weekView.fullCalendar('addEventSource', $scope.events);
    }

    var calendarCanvas;

    function captureCalendarCanvas() {
        html2canvas(document.getElementById('full-calendar-div'), {
            onrendered: function(canvas) {
                calendarCanvas = canvas;
            }
        });
    }

}]);
