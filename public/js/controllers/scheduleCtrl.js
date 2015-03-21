/*
Controller for schedule

Includes Full Calendar config, prev/next buttons, and add more courses button
*/
winstonApp.controller('scheduleCtrl', ['$scope', '$window', '$location', 'uiCalendarConfig', '$timeout', 'readyMadeSchedules', 'addedBusyTime', '$modal', 'preferencesValues', 'localStorageService', '$document', function($scope, $window, $location, uiCalendarConfig, $timeout, readyMadeSchedules, addedBusyTime, $modal, preferencesValues, localStorageService, $document) {

    /*
    angular-local-storage
    */
    $scope.addedBusyTime = addedBusyTime.data;
    $scope.$watchCollection('addedBusyTime', function() {
        localStorageService.set('addedBusyTime.data', $scope.addedBusyTime);
    });

    $scope.preferencesValues = preferencesValues.data;
    $scope.$watchCollection('preferencesValues', function() {
        localStorageService.set('preferencesValues.data', $scope.preferencesValues);
    });

    /*
    ******************************************************
    Get the schedule data from readyMadeSchedules service
    ******************************************************
    */

    $window.scrollTo(0,0);

    // Array of ready to go schedules in Full Calendar format
    var arrayOfSchedules = readyMadeSchedules.readyMadeSchedules;

    $scope.events = [];
    $scope.scheduleIndex = 0;
    var id = addedBusyTime.data.length || 0;

    disallowEditAllBusyTime();

    if (arrayOfSchedules !== null) {
        $scope.scheduleLength = arrayOfSchedules.length;
        $scope.events = arrayOfSchedules[0].concat(addedBusyTime.data);
    } else {
        $scope.events = addedBusyTime.data;
    }

    $timeout(function() {
        refreshCalendar();
        captureCalendarCanvas();

        $('div.fc-time-grid-container').each(function() {
            this.style.setProperty('background-color', viewColor, 'important'); 
            $('.fc-today').removeClass('fc-today');
        });

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
                    color: '#263238',
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
    *********************************************
    Left right arrow key hotkeys
    *********************************************
    */
    $document.bind('keydown', function(event) {
        if ($location.path() != '/schedule' || arrayOfSchedules === null) {
            return;
        }
        
        if (event.keyCode === 39) {
            $scope.displayDifferentSchedule(1);
        }
        else if (event.keyCode === 37) {
            $scope.displayDifferentSchedule(0);
        }
    });

    /*
    ****************************************
    Handle clicks on toggle schedule button
    ****************************************
    */

    // Event handle for prev/next buttons
    $scope.displayDifferentSchedule = function (forward) {

        if (arrayOfSchedules === null || $scope.editableMode) {
            return;
        }

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

    $scope.busyTimeButtonText = "Customize";
    $scope.editableMode = false;

    function startEditableMode() {
        $scope.editableMode = true;
        $scope.busyTimeButtonText = "Done";

        allowEditAllBusyTime();

        // Allow busy time to be added anywhere
        $scope.events = addedBusyTime.data;
        refreshCalendar();

        enableEditModeColors();

    }

    var baseEditColor = '#90CAF9';
    var hoverEditColor = '#64B5F6';
    var viewColor = '#EFEFEF';

    function enableEditModeColors() {
        $('div.fc-time-grid-container').each(function() {
            this.style.setProperty('background-color', baseEditColor, 'important');
            $(this).hover(function() {
                this.style.setProperty('background-color', hoverEditColor, 'important');
             }, function() {
                this.style.setProperty('background-color', baseEditColor, 'important');
             });
        });
    }

    function removeEditModeColors() {
        $('div.fc-time-grid-container').each(function() {
            this.style.setProperty('background-color', viewColor, 'important');
            $(this).unbind('mouseenter mouseleave');
        })
    }

    function startViewMode() {
        $scope.fetchingSchedules = true;

        removeEditModeColors();

        var eventsCopy = $scope.events.slice(0);
        addedBusyTime.data.length = 0;
        Array.prototype.push.apply(addedBusyTime.data, eventsCopy);

        prefs = [$scope.morningPref, $scope.marathonPref, $scope.nightPref];
        preferencesValues.data.length = 0;
        Array.prototype.push.apply(preferencesValues.data, prefs);

        prefIndex = 0;
        $scope.currentPref = prefs[0];
        $scope.currentPrefName = prefNames[0];

        disallowEditAllBusyTime();

        $scope.busyTimeButtonText = "Customize";

        // Regenerate the schedules
        readyMadeSchedules.getSchedulesPromise().then(function() {
            arrayOfSchedules = readyMadeSchedules.readyMadeSchedules;

            if (arrayOfSchedules !== null) {
                $scope.scheduleIndex = 0;
                $scope.scheduleLength = arrayOfSchedules.length;
                $scope.events = arrayOfSchedules[0].concat(addedBusyTime.data);
            } else {
                $scope.events = addedBusyTime.data;
                $scope.scheduleLength = 0;
            }

            refreshCalendar();

            $scope.fetchingSchedules = false;
        });
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
    Help Button
    **********************************
    */

    $('#help-button').attr("data-title", "Adjust the sliders and draw busy time on the schedule. When you're done, the schedules will be regenerated to meet your preferences.");
    $('#help-button').tooltip({ item: "help-button[data-title]"});

    /*
    **********************************
    Preferences
    **********************************
    */

    if (preferencesValues.data.length === 3) {
        $scope.morningPref = preferencesValues.data[0];
        $scope.marathonPref = preferencesValues.data[1];
        $scope.nightPref = preferencesValues.data[2];
    } else {
        $scope.morningPref = null;
        $scope.marathonPref = null;
        $scope.nightPref = null;
    }

    var prefNames = ['Mornings?', 'Marathons?', 'Nights?'];
    var prefIndex = 0;

    $scope.currentPref = $scope.morningPref;
    $scope.currentPrefName = prefNames[0];

    $scope.$watch('currentPref', function() {
        switch(prefIndex) {
            case 0:
                $scope.morningPref = $scope.currentPref;
                break;
            case 1:
                $scope.marathonPref = $scope.currentPref;
                break;
            case 2:
                $scope.nightPref = $scope.currentPref;
                break;
        }
        prefs = [$scope.morningPref, $scope.marathonPref, $scope.nightPref];
    });

    $scope.nextPref = function() {
        if (!$scope.editableMode) {
            return;
        }
        if (prefIndex < 2) {
            prefIndex ++;
            $scope.currentPref = prefs[prefIndex];
            $scope.currentPrefName = prefNames[prefIndex];
        }
    }

    $scope.prevPref = function() {
        if (!$scope.editableMode) {
            return;
        }
        if (prefIndex > 0) {
            prefIndex --;
            $scope.currentPref = prefs[prefIndex];
            $scope.currentPrefName = prefNames[prefIndex];
        }
    }

    /*
    *********************************************************************
    Open calendar as png in new tab/window (seems to depend on browser)
    *********************************************************************
    */

    $scope.image = function() {
        $scope.events = arrayOfSchedules[$scope.scheduleIndex];
        refreshCalendar();
        captureCalendarCanvas();
        $timeout(function() {
            $window.open(calendarCanvas.toDataURL('image/png'));
            $scope.events = arrayOfSchedules[$scope.scheduleIndex].concat(addedBusyTime.data);
            refreshCalendar();
            captureCalendarCanvas();
        }, 500);
    }

    $scope.backToBrowse = function() {
        disableTooltips();
        $location.path('/browse');
    }

    function disableTooltips() {
        $('.fc-time-grid-event').each(function() {
            $(this).tooltip('disable');
        })
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
    }

}]);
