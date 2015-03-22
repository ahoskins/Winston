var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var htmlreplace = require('gulp-html-replace');
var minifiy_css = require('gulp-minify-css');
var main_bower = require('main-bower-files');
var filter = require('gulp-filter');

var bower_dir = 'public/js/lib/vendor/bower_components';

/**
Starting point for gulp... the default task is a blank task depending on the array passed in
*/
gulp.task('default', ['minify-js', 'replace-js', 'minify-css', 'replace-css', 'minify-bower', 'replace-bower', 'minify-libs', 'replace-libs']);


/****************************************
                 Minify
*****************************************/

/**
These are all js files from winstonApp
*/
gulp.task('minify-js', function() {
  return gulp.src(['public/js/app.js', 'public/js/controllers/*.js', 'public/js/services/*.js'])
  	.pipe(concat('app.min.js'))
  	.pipe(uglify())
  	.pipe(gulp.dest('public/js/app-min'))
  	.pipe(notify({ message: 'Finished minifying app (excluding bower)'}));
});

/**
Make sure to manually add new css libs here
*/
gulp.task('minify-css', function() {
  return gulp.src([bower_dir + '/normalize.css/normalize.css', 
    bower_dir + '/bootstrap/dist/css/bootstrap.css', 
    bower_dir + '/angular-material/angular-material.css', 
    bower_dir + '/fullcalendar/dist/fullcalendar.css', 
    '//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css', 
    bower_dir + '/ngprogress-lite/ngprogress-lite.css', 
    bower_dir + '/angular-socialshare/angular-socialshare.css', 
    'public/css/style.css'])
  .pipe(concat('css.min.css'))
  .pipe(minifiy_css())
  .pipe(gulp.dest('public/css/css-min'))
  .pipe(notify({ message: 'Finished minifying css'}));
});

/**
This grabs all main bower js files...if its in bower, its included in here
*/
gulp.task('minify-bower', function() {
  var jsFilter = filter('*.js')
  return gulp.src(main_bower())
    .pipe(jsFilter)
    .pipe(concat('bower.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js/bower/bower-min'))
    .pipe(notify({ message: 'Finished minifying bower'}))
    .pipe(jsFilter.restore());
});

/**
Make sure to manually add new libs into this!
*/
gulp.task('minify-libs', function() {
  return gulp.src(['public/js/lib/calendar.js',
    'public/js/lib/filterStabilize.js',
    'public/js/lib/fuse.min.js',
    'public/js/lib/memoize.js',
    'public/js/lib/twitter.min.js'
    ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('public/js/libs/libs-min'))
  .pipe(notify({ message: 'Finished minifying libs'}));
});

/****************************************
                  Replace
*****************************************/

gulp.task('replace-libs', ['minify-libs'], function() {
  return gulp.src('views/libs.html')
  .pipe(htmlreplace({
    'js': 'js/libs/libs-min/libs.min.js'
  }))
  .pipe(notify({ message: 'Finished replacing libs in html'}))
  .pipe(gulp.dest('views/build'));
})

gulp.task('replace-bower', ['minify-bower'], function() {
  gulp.src('views/bower.html')
  .pipe(htmlreplace({
    'js': 'js/bower/bower-min/bower.min.js'
  }))
  .pipe(notify({ message: 'Finished replacing bower in html'}))
  .pipe(gulp.dest('views/build'));
});

gulp.task('replace-js', ['minify-js'], function() {
	gulp.src('views/includes.html')
	.pipe(htmlreplace({
  		'js': 'js/app-min/app.min.js'
  	}))
  .pipe(notify({ message: 'Finished replacing js in html'}))
  .pipe(gulp.dest('views/build'));
});

gulp.task('replace-css', ['minify-css'], function() {
  gulp.src('views/styles.html')
  .pipe(htmlreplace({
    'css': 'css/css-min/css.min.css'
  }))
  .pipe(notify({ message: 'Finished replacing css in html'}))
  .pipe(gulp.dest('views/build'));
});

