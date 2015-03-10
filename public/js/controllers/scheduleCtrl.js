/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonControllers.controller('scheduleCtrl', ['$scope', '$window', '$location', 'uiCalendarConfig', '$timeout', 'SubjectBin', 'readyMadeSchedules', '$facebook', 'addedBusyTime', '$modal', 'preferencesValues', function($scope, $window, $location, uiCalendarConfig, $timeout, SubjectBin, readyMadeSchedules, $facebook, addedBusyTime, $modal, preferencesValues) {

    /*
    ******************************************************
    Get the schedule data from readyMadeSchedules service
    ******************************************************
    */

    $window.scrollTo(0,0);

    // Array of ready to go schedules in Full Calendar format
    var arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

    $scope.events = [];
    $scope.scheduleIndex = 0;
    var id = 0;

    if (arrayOfSchedules !== null) {
        $scope.scheduleLength = arrayOfSchedules.length;
        $scope.events = arrayOfSchedules[0].concat(addedBusyTime.data);
    } else {
        $scope.events = addedBusyTime.data;
    }

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


            // eventMouseover to do the tooltip if the other one drives me crazy

            defaultView: 'agendaWeek',
            columnFormat: "dddd",
            hiddenDays: [0,6],
            minTime: '08:00:00',
            maxTime: '21:00:00',
            allDaySlot: false,

            // Event settings
            allDayDefault: false,
            //timezoneParam: 'local'

            /*
            Tooltip with the desciption on all courses
            */
            eventRender: function(event, element) {
                $(element).attr("title", event.description);
                $(element).tooltip({ container: "body"});
            },

            /*
            *********************************************************************************************************
            The following events are for edit mode only

            They operate directly on $scope.events because this is the calendars perspective of events.  
            Once edit mode is done, $scope.events is assigned to addedBusyTime.data.
            **********************************************************************************************************
            */

            /**
            On click of empty space on calendar add this as busytime to $scope.events
            */
            select: function(start, end) {

                if (!$scope.editableMode) {
                    return;
                }

                $scope.events.push({
                    durationEditable: true,
                    title: 'Busy Time',
                    start: start,
                    end: end,
                    color: '#EF9A9A',
                    id: id++
                });
                refreshCalendar();
            },

            /**
            On click of busytime on calendar delete from $scope.events
            */
            eventClick: function(calEvent, jsEvent, view) {

                // Only allowed to delete busy times
                if (calEvent.title !== 'Busy Time') {
                    return;
                }

                if (calEvent.durationEditable === false) {
                    return;
                }

                $scope.events.forEach(function(ev) {
                    if (ev.id === calEvent.id) {
                        $scope.events.splice($scope.events.indexOf(ev), 1);
                    }
                });

                refreshCalendar();
            },  

            /*
            On resize of busy time replace old busytime with new in $scope.events
            */
            eventResizeStop: function(calEvent, jsEvent, ui, view) {

                $scope.events.forEach(function(ev) {
                    if (ev.id === calEvent.id) {
                        $scope.events[$scope.events.indexOf(ev)] = calEvent;
                    }
                })
            }
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

        $scope.events = arrayOfSchedules[$scope.scheduleIndex].concat(addedBusyTime.data);

        refreshCalendar();
        captureCalendarCanvas();
    };

    $scope.backToBrowse = function() {
        $location.path('/browse');
    }

    $scope.busyTimeButtonText = "Edit Preferences";
    $scope.editableMode = false;

    function startEditableMode() {
        $scope.editableMode = true;
        $scope.busyTimeButtonText = "Save Preferences"

        allowEditAllBusyTime();

        // Allow busy time to be added anywhere
        $scope.events = addedBusyTime.data;
        refreshCalendar();
    }

    function startViewMode() {
        addedBusyTime.data = $scope.events;
        preferencesValues.data = [$scope.morningPref, $scope.marathonPref, $scope.nightPref];

        disallowEditAllBusyTime();

        $scope.busyTimeButtonText = "Edit Preferences";

        // Regenerate the schedules
        if (arrayOfSchedules !== null) {
            readyMadeSchedules.getSchedulesPromise(true).then(function() {
                arrayOfSchedules = readyMadeSchedules.getReadyMadeSchedules();

                $scope.scheduleLength = arrayOfSchedules.length;

                if ($scope.scheduleLength === 0) {

                    var modalInstance = $modal.open({
                        templateUrl: 'addLessBusyTimeModal.html',
                        controller: 'addLessBusyTimeModalCtrl'
                    });

                    startEditableMode();

                    return;
                }

                $scope.scheduleIndex = 0;

                $scope.events = arrayOfSchedules[0].concat(addedBusyTime.data);

                refreshCalendar();
            });
        } else {
            refreshCalendar();
        }
    }

    $scope.open = function() {
        $scope.editableMode = !$scope.editableMode;

        // Editable mode
        if ($scope.editableMode) {
            startEditableMode();
        } 
        // View mode
        else {
            startViewMode();
        }
    }

    /*
    **********************************
    Preferences
    **********************************
    */

    $scope.morningPref = null;
    $scope.marathonPref = null;
    $scope.nightPref = null;

    $('#help-button').attr("data-title", "The generated schedules will be swayed to favour your preferences.  If you don't care just keep the sliders in the middle!");
    $('#help-button').tooltip({ item: "help-button[data-title]"});

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

    $scope.image = function() {
        $window.open(calendarCanvas.toDataURL('image/png'));
    }

    $scope.backToBrowse = function() {
        $location.path('/browse');
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

    function allowEditAllBusyTime() {
        addedBusyTime.data.forEach(function(busyTime) {
            busyTime.durationEditable = true;
        });
    }

    function disallowEditAllBusyTime() {
        addedBusyTime.data.forEach(function(busyTime) {
            busyTime.durationEditable = false;
        });
        console.dir(addedBusyTime.data);
    }

}]);
