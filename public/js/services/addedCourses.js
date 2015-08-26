/*
Service to hold addedCourses
Perfect for information sharing between controllers because it is a Singleton
*/
winstonApp.factory('addedCourses', ['localStorageService', 'currentTerm', function(localStorageService, currentTerm) {
	var factory = {};

	factory.data = localStorageService.get('addedCourses.data') && localStorageService.get('addedCourses.data')[currentTerm.termId] || [{
		id: 'core',
		courses: []
	}];

	factory.draggedCourse = null;

	/*
	check if a course object exists somewhere in the added courses
	*/
	factory.contains = function(courseObject) {
		var found = false;
		factory.data.forEach(function(group) {
			group.courses.forEach(function(course) {
				if (courseObject.asString === course.asString) {
					found = true;
				}
			});
		});
		return found;
	}

	/*
	Remove a course from it's current group and remove the group if it's now empty
	*/
	factory.remove = function(courseObject) {
		if (courseObject == null) return;
		var i = 0;
		factory.data.forEach(function(group) {
			var j = 0;
			group.courses.forEach(function(course) {
				if (courseObject.asString === course.asString) {
					group.courses.splice(j, 1);
					if (i > 0 && group.courses.length === 0) {
						factory.data.splice(i, 1);
					}
				}
				j ++;
			});
			i ++;
		});
	}

	factory.empty = function() {
		factory.data = [{
			id: 'core',
			courses: []
		}];
	}

	/*
	returns true if given course exists in given group
	*/
	factory.existsInGroup = function(newCourse, droppedGroup) {
		var found = false;
		droppedGroup.courses.forEach(function(course) {
			if (course.asString === newCourse.asString) {
				found = true;
			}
		});
		return found;
	}

	factory.addToGroup = function(droppedGroup, newCourse) {
		if (newCourse == null) return;
		factory.remove(newCourse);
		
		var groupIndex = 0;
		var freeze = true;
        factory.data.forEach(function(group) {
            if (group.id == droppedGroup.id) {
                group.courses.push(newCourse);
                if (groupIndex === factory.data.length - 1) {
                    freeze = false;
                }
            }
            groupIndex ++;
        });
        return freeze;
	}

	factory.updateLocalStorage = function() {
		var all = localStorageService.get('addedCourses.data') || {};
		all[currentTerm.termId] = factory.data;
		localStorageService.set('addedCourses.data', all);
	}

	return factory;
}]);

/*

addedCourses.data['1490'] = [{
	id: core,
	courses: []
},
{
	id: 1,
	courses: []
},
{
	id: 2,
	courses: []
}]

**/

