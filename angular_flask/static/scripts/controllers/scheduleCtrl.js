// Schedule Controller
//

coreModule.controller('scheduleCtrl', ['$scope', '$window', '$rootScope', function($scope, $window, $rootScope) {
    // Event array
    $scope.events = [
        {title: 'All Day Event',start: new Date('Tue Nov 5 2014 09:00:00 GMT+0530 (IST)'),end: new Date('Tue Nov 5 2014 10:00:00 GMT+0530 (IST)')},
        {title: 'Long Event',start: new Date('Tue Nov 5 2014 10:00:00 GMT+0530 (IST)'),end: new Date('Tue Nov 5 2014 11:00:00 GMT+0530 (IST)')},
        {id: 999,title: 'Repeating Event',start: new Date('Tue Nov 4 2014 09:00:00 GMT+0530 (IST)'),allDay: false}
    ];

    // EventSources (required as binding to angular HTML directive)
    $scope.eventSources = [$scope.events];

    // General calendar config
    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: true,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            defaultView: 'agendaWeek',
            columnFormat: "dddd",
            hiddenDays: [0,6]
        }
    };


}]);
