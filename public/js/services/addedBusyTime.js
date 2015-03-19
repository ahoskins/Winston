winstonApp.factory('addedBusyTime', ['localStorageService', function(localStorageService) {
	var factory = {};

	factory.data = localStorageService.get('addedBusyTime.data') || [];

	factory.apiFormattedData = [];

	factory.generateApiFormattedBusyTimes = function() {
		factory.apiFormattedData = [];
        factory.data.forEach(function(event) {
            if (event.title === 'Busy Time') {
                factory.apiFormattedData.push(createBusyObject(event));
            }
        });
    }

	var createBusyObject = function(event) {
        var busyObject = {};

        // localStorage stringifies the moment() objects as UTC datetime strings
        event.start = moment.utc(event.start);
        event.end = moment.utc(event.end);

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


	return factory;
}]);
