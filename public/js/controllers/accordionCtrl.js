// Accordion Controller
//

winstonApp.controller('accordionCtrl', ['$scope', '$window', 'detailFactory', 'courseDataMaker', '$timeout', '$location', 'pmkr.filterStabilize', 'addedCourses', 'localStorageService', function($scope, $window, detailFactory, courseDataMaker, $timeout, $location, stabilize, addedCourses, localStorageService) {

    var date = new Date();
    $scope.currentDay = date.toDateString();

    /*
    ********************************************************************
    Get the courses data from the pre-resolved service
    ********************************************************************
     */
    $scope.courseData = courseDataMaker.treeCourses;
    $scope.courseDataFlatCourses = courseDataMaker.getFlattenedCourses();
    $scope.courseDataFlatSubjects = courseDataMaker.getFlattenedSubjects();

    /*
    ******************************
    On-click of accordion handlers
    ******************************
     */

     // @callee: 1st layer of accordion (on click)
     //
     // When open -> logical true, when closed -> logical false
     $scope.subjects = [];
     $scope.renderSubjects = function (faculty, $event) {
        // Make sure accordion will either open or close as a result of this click
        // To the ensure the $scope.subjects[faculty] MATCHES open state of accordion
        if ($event.target.className !== "ng-binding") {
            return;
        }
        // Invert it
        $scope.subjects[faculty] = !$scope.subjects[faculty];
     }


    // @callee: 2nd layer of accordion (on click)
    //
    // When open -> logical true, when closed -> logical false
    $scope.courses = [];
    $scope.renderCourses = function (subject, $event) {
        if ($event.target.className !== "ng-binding") {
            return;
        }
        // Invert it
        $scope.courses[subject] = !$scope.courses[subject];
    };

    // @callee: 3rd layer of accordion
    //
    // On click of 3rd layer of accordion
    // Retrieves course details and displays it
    // Note: one it is displayed, never erased from the DOM (cut on calls to the server)
    $scope.description = {};
    $scope.credits = {};
    $scope.faculty = {};
    $scope.subjectTitle = {};
    $scope.showId = [];
    $scope.loadMore = function (courseIdNumber) {
        // Only call API if not yet added to $scope.description
        if (!$scope.description.hasOwnProperty(courseIdNumber)) {
            detailFactory.getDetails(courseIdNumber).
                success(function (data) {
                    var result = angular.fromJson(data);
                    $scope.description[courseIdNumber] = result.courseDescription;
                    $scope.credits[courseIdNumber] = result.units;
                    $scope.faculty[courseIdNumber] = result.faculty;
                    $scope.subjectTitle[courseIdNumber] = result.subjectTitle;
                })
                .error(function () {
                    $window.alert("Something fucked up.");
                });
        }
    };

    /*
    **************************
    Searching
    **************************
     */

    // Watch the searchBox every 500ms
    var searchTextTimeout;
    $scope.$watch('model.searchBox', function(val) {
        // Suppress type warnings
        if (!isString(val)) {
            return;
        }

        if (searchTextTimeout) {
            $timeout.cancel(searchTextTimeout);
        }
        searchTextTimeout = $timeout(function() {
            $scope.searchText = val;
        }, 500);
    });

    function breakAtIndex(index, string) {
        return string.substring(0, index + 1) + ' ' + string.substring(index + 1);
    }

    function inSubjects(searchText, subjects) {
        var match = false
        subjects.forEach(function(subject) {
            if(subject === searchText.toUpperCase()) {
                match = true;
            }
        });
        return match;
    }

    $scope.courseSearchResults = stabilize(function (searchText) {
        if (!_.isString(searchText)) {
            return;
        }

        // This will find and correct spacing mistakes in the search string
        var matches = false;
        if (!inSubjects(searchText, $scope.courseDataFlatSubjects)) {
            for (var i = 0; i < searchText.length - 1; i++) {
                var string = breakAtIndex(i, searchText);
                if (inSubjects(string, $scope.courseDataFlatSubjects)) {
                    searchText = string;
                    break;
                }
            }
        }

        var fuseCourseTitle = new Fuse($scope.courseDataFlatCourses, {
            keys: ['courseTitle'],
            includeScore: true
        });
        var fuseSubjectTitle = new Fuse($scope.courseDataFlatCourses, {
            keys: ['subjectTitle'],
            includeScore: true
        });
        // asString is another option here 'MATH 100'
        var fuseClassCode = new Fuse($scope.courseDataFlatCourses, {
            keys: ['subject'],
            includeScore: true
        });
        var fuseClassNumber = new Fuse($scope.courseDataFlatCourses, {
            keys: ['number'],
            includeScore: true
        });

        /*
        Match based on each key
        Note that if there is no match at all, the iterm is NOT added to results array

        A perfect match is a score of 0.  1 is the maximum, before it won't be added to results.
        */
        var text = searchText.replace(/[0-9]/g, '');
        var results = [];
        Array.prototype.push.apply(results, _.map(fuseSubjectTitle.search(text), function(res) {
            return _.extend(res, { 'weight': 100});
        }));
        Array.prototype.push.apply(results, _.map(fuseClassCode.search(searchText), function(res) {
            return _.extend(res, { 'weight': 5})
        }));
        Array.prototype.push.apply(results, _.map(fuseClassCode.search(text.toUpperCase()), function(res) { 
            return _.extend(res, { 'weight': 1})
        }));
        if (searchText.match(/\d+/) !== null) {
            var number = searchText.match(/\d+/)[0];
            Array.prototype.push.apply(results, _.map(fuseClassNumber.search(number), function(res) {
                return _.extend(res, { 'weight': 20})
            }));
        }

        /*
        Find the top two closest matching keys

        If there isn't two close matching keys, make sure its not shown as a result
        */
        results =  _.chain(results)
                    .groupBy(function(result) {
                        return result.item.course;
                    })
                    .map(function(value, key) { // key: course ID, value: arrray of <result> matching that ID

                        // Low score is high in the search results
                        var compositeScore = 0;

                        if (value.length < 2) {
                            compositeScore += 100;
                        } else {
                            // Find two smallest scores
                            //
                            // first smallest
                            var min = value[0];
                            angular.forEach(value.slice(1), function(result) {
                                if (result.score < min.score) {
                                    min = result;
                                }
                            });
                            // next smallest, remove the smallest first
                            value.splice(value.indexOf(min), 1)
                            var nextMin = value[0];
                            angular.forEach(value.slice(1), function(result) {
                                if (result.score < nextMin.score) {
                                    nextMin = result;
                                }
                            });

                            compositeScore = (min.score) + (nextMin.score);
                        }

                        return {
                            item: value[0].item, // each item is the same because they are grouped according to this
                            score: compositeScore
                        }
                    })
                    .sortBy(function(result) {
                        // smallest to largest
                        return result.score;
                    })
                    .value()
                    .slice(0, 100);


        // results = _.chain(results)
        //            .sortBy(function(result) {
        //                 return result.score * result.weight;
        //             })
        //            .uniq(function(result) {
        //                 return result.item
        //             })
        //            .value()
        //            .slice(0, 100);

        results = _.pluck(results, 'item');

        return results;
    });


    /*
    **********************************************************************
                               Add/remove course
    **********************************************************************
     */
    $scope.contains = addedCourses.contains;
    $scope.addedCoursesData = addedCourses.data;

    $scope.addOrRemove = function(courseObject) {
        if (addedCourses.contains(courseObject)) {
            // remove functionality allowing you to remove!!!
            // addedCourses.remove(courseObject);
            // addedCourses.updateLocalStorage();
        } else {
            addedCourses.data[0].courses.push(courseObject);
            addedCourses.updateLocalStorage();
        }
    }

    /*
    **********************************************************************
    Feedback from user
    **********************************************************************
     */
    $scope.feedback = '';
    $scope.givenFeedback = false;
    $scope.submitFeedback = function() {
        // send email with feedback as body
        $.ajax({
            'type': 'POST',
            'url': 'https://mandrillapp.com/api/1.0/messages/send.json',
            'data': {
                'key': 'utwbngMF5Cj7INTzNoaiww',
                'message': {
                  'from_email': 'andrew@andrewhoskins.ca',
                  'to': [
                      {
                        'email': 'arhoskin@ualberta.ca',
                        'type': 'to'
                      },
                      {
                        'email': 'ross.anderson@ualberta.ca',
                        'type': 'to'
                      },
                    ],
                  'autotext': 'true',
                  'subject': 'Winston feedback',
                  'html': $scope.feedback
                }
            }
        });

        // regardless of success, the user doesn't care, tell them thanks :)
        // when this controller is reinitialized they can give feedback again
        $scope.givenFeedback = true;
    }

    /*
    ****************
    Validation Functions
    ****************
     */
    var isNumber = function(val) {
        return !isNaN(parseFloat(val));
    };
    var isString = function(val) {
        return (typeof val === "string");
    };

}]);
