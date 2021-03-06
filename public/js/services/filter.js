// Filter the list of courses
//
//
// Filter the "courseData" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "courseData"
// All filtering is CASE IN-SENSITIVE

winstonApp.filter('courseFilter', ['pmkr.filterStabilize', '$window', function(stabilize, $window) {
    // Invoked from index.html accordion
    // Used filterText to trim courseData
    // @param {Object} $scope.courseData is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.courseData
    // BUILD-UP METHOD
    //
    return stabilize(function(courseData, field) {

        var result = [];

        if (!_.isString(field)) {
            return;
        }

        function flattenCourses(facultyArr) {
            return _.chain(facultyArr)
                .map(function(faculty) {
                    return _.map(faculty.subjects, function(subject) {
                        return _.map(subject.courses, function(course) {
                            return _.extend(
                                _.pick(faculty, 'faculty'),
                                _.pick(subject, 'subject', 'subjectTitle'),
                                _.pick(course, 'course', 'asString', 'courseTitle'));
                        });
                    });
                })
                .flatten()
                .value();
        }

        var searchableCourses = flattenCourses(courseData);
        // console.log(courseData);
        // console.log(searchableCourses);
        var fuseCourseTitle = new Fuse(searchableCourses, {
            keys: ['courseTitle'],
            includeScore: true
        });
        var fuseSubjectTitle = new Fuse(searchableCourses, {
            keys: ['subjectTitle'],
            includeScore: true
        });
        var fuseClassCode = new Fuse(searchableCourses, {
            keys: ['asString'],
            includeScore: true
        });


        var resultsCourseTitle = fuseCourseTitle.search(field),
            resultsSubjectTitle = fuseSubjectTitle.search(field),
            resultsClassCode = fuseClassCode.search(field);
        console.log(resultsCourseTitle);
        console.log(resultsSubjectTitle);
        console.log(resultsClassCode);
        console.log('=============================================');

        return [];
    });

}]);

