// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', 'scheduleFactory', function($scope, $window, $rootScope, scheduleFactory) {

    $rootScope.scheduleMode = false;

    /*
    ********************
    Full Calendar Config
    ********************
     */

    //Event array
    $scope.events = [];

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

    /*
    *************************************************************
    Generate schedules
    Step 1: Call the schedule factory and parse the JSON
    Step 2: Create a closure called scheduleInstance, and invoke it at the first schedule
    *************************************************************
     */

    var scheduleInstance;

    // When click on "Add more courses" button from schedule view
    $scope.showAccordion = function () {
        // switch to accordion view
        $rootScope.scheduleMode = false;
    }

    // Event handle for "Generate Schedule" button
    $scope.getSchedules = function () {
        // Clear current events
        clearEvents();

        // Clear index
        $scope.scheduleIndex = 0;

        // Make sure some courses added
        if ($rootScope.addedCourses.length === 0) {
            $window.alert("Add some courses first.");
            return;
        }

        // Show schedule view
        $rootScope.scheduleMode = true;

        scheduleFactory.getSchedules($rootScope.addedCourses).
            success(function (data) {

                var scheduleListing = angular.fromJson(data);

                $scope.scheduleLength = scheduleListing.objects.length;

                // Check if server returned no schedules available
                if ($scope.scheduleLength === 0) {
                    $rootScope.scheduleMode = false;
                    $window.alert("No schedules found.");
                    return;
                }

                // Create closure with current scheduleListing
                scheduleInstance = renderSchedule(scheduleListing);

                scheduleInstance(0); 

            }).
            error(function() {
                $window.alert("Server not responding.");
            });
    };

    /*
    Render schedules based on a single server response
    @param {object}: response from server

    @returns {closure}: closure invokable by schedule index
    */
    function renderSchedule (scheduleListing) {

        // Return closure of scheduleListing
        //
        // @param {int}: schedule index within the JSON response
        // @return {void}: updates $scope.events
        return function (i) {

            var cachedColors = [];

            // A brighter color scene custom made by myself!
            //var colorPallet = ['#FF530D', '#227831', '#AFDEE8', '#2F4BE8', '#443111', '#83a283'];

            // Earthy color pallet
            var colorPallet = ['#443111', '#227831', '#af9b56', '#2a4560', '#83a283'];
            
            var colorPalletIndex = 0;

            scheduleListing.objects[i].sections.forEach(function (classtime) {

                // Null check
                if (classtime.startTime === null ||
                    classtime.endTime === null   ||
                    classtime.day === null         ) {
                    return;
                }

                /*
                ****
                Time
                ****
                 */
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

                /*
                *****
                Color
                *****
                 */
                var currentColor;
                var foundColor = false;

                cachedColors.forEach(function (cachedCourse) {
                    // Already in cached colors
                    if (cachedCourse.name === classtime.course) {
                        currentColor = cachedCourse.color;
                        foundColor = true;
                    }
                });

                // Not already in cache
                if (!foundColor) {
                    currentColor = colorPallet[colorPalletIndex];
                    cachedColors.push({name: classtime.course, color: currentColor});
                    colorPalletIndex = colorPalletIndex + 1;
                }

                /*
                ***
                Day
                ***
                 */
                var date = new Date(),
                    d = date.getDate(),
                    m = date.getMonth(),
                    y = date.getFullYear();

                // Note: JavaScript function Date.getDay() returns enum of current day of the week

                // @return {int} enumeration of current day of the week
                var dayNumber = date.getDay(),
                    offset;

                // Use the current day {int:0:6} of the week
                // Enumerate each day of the week {int:0:6}
                // and find the offset {int:0:6}
                // Use this offset to find calendar day number  {int:0:31}
                if (classtime.day.match(/M/)) {
                    offset = 1 - dayNumber;
                    addEvent();
                }

                if (classtime.day.match(/T/)) {
                    offset = 2 - dayNumber;
                    addEvent();
                }

                if (classtime.day.match(/W/)) {
                    offset = 3 - dayNumber;
                    addEvent();
                }

                if (classtime.day.match(/R/)) {
                    offset = 4 - dayNumber;
                    addEvent();
                }

                if (classtime.day.match(/F/)) {
                    offset = 5 - dayNumber;
                    addEvent();
                }

                // Add event //
                //
                function addEvent() {
                    $scope.events.push({
                        title: classtime.asString,
                        start: new Date(y, m, d + offset, startHour, startMinute),
                        end: new Date(y, m, d + offset, endHour, endMinute),
                        color: currentColor
                    });
                }

            });
        };
    }

    /*
    **********************************************
    Display different schedule by...
    1. Clear current events
    2. Re-invoke the closure with a different index
    **********************************************
     */

    $scope.scheduleLength = 0;
    $scope.scheduleIndex = 0;
    // Event handle for prev/next buttons
    $scope.displayDifferentSchedule = function (forward) {

        // Adjust schedule index
        if (forward) {
            $scope.scheduleIndex = $scope.scheduleIndex + 1;
            if ($scope.scheduleIndex >= $scope.scheduleLength) {
                $scope.scheduleIndex = $scope.scheduleLength - 1;
            }
        }
        else {
            $scope.scheduleIndex = $scope.scheduleIndex - 1;
            if ($scope.scheduleIndex < 0) {
                $scope.scheduleIndex = 0;
            }
        }

        clearEvents();

        // Invoke the closure on the new index
        scheduleInstance($scope.scheduleIndex);
    };


    // Event handle for clearing single course
    $scope.removeFromSchedule = function(course) {
        var index = $scope.addedCourses.indexOf(course);
        if (index > -1) {
            $scope.addedCourses.splice(index, 1);
        }
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
