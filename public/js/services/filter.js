// Filter the list of courses
//
//
// Filter the "subjectBin" object against the "subjectTitle" and "asString"
// fields of each course.  It also filters against the "key"(s) in "subjectBin"
// All filtering is CASE IN-SENSITIVE

winstonApp.filter('courseFilter', ['pmkr.filterStabilize', '$window', function(stabilize, $window) {
    // Invoked from index.html accordion
    // Used filterText to trim subjectBin
    // @param {Object} $scope.subjectBin is passed in
    // @param {Object} $scope.filterText is passed in
    //
    // @returns {Object} same format as $scope.subjectBin
    // BUILD-UP METHOD
    //
    return stabilize(function(subjectBin, field) {

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

        var searchableCourses = flattenCourses(subjectBin);
        // console.log(subjectBin);
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

