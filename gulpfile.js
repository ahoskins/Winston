var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var htmlreplace = require('gulp-html-replace');
var minifiy_css = require('gulp-minify-css');

var bower_dir = 'public/js/lib/vendor/bower_components';


gulp.task('default', ['minify-js', 'replace-js', 'minify-css', 'replace-css']);

gulp.task('minify-js', function() {
  return gulp.src(['public/js/app.js', 'public/js/controllers/*.js', 'public/js/services/*.js'])
  	.pipe(concat('app.min.js'))
  	.pipe(uglify())
  	.pipe(gulp.dest('public/js/app-min'))
  	.pipe(notify({ message: 'Finished minifying app (excluding bower)'}));
});

gulp.task('minify-css', function() {
  return gulp.src(['public/js/lib/vendor/bower_components/normalize.css/normalize.css', 
    'public/js/lib/vendor/bower_components/bootstrap/dist/css/bootstrap.css', 
    'public/js/lib/vendor/bower_components/angular-material/angular-material.css', 
    'public/js/lib/vendor/bower_components/fullcalendar/dist/fullcalendar.css', 
    'public/js/lib/vendor/bower_components/font-awesome/css/font-awesome.css', 
    'public/js/lib/vendor/bower_components/ngprogress-lite/ngprogress-lite.css', 
    'public/js/lib/vendor/bower_components/angular-socialshare/angular-socialshare.css', 
    'public/css/style.css'])
  .pipe(concat('css.min.css'))
  .pipe(minifiy_css())
  .pipe(gulp.dest('public/css/css-min'))
  .pipe(notify({ message: 'Finished minifying css'}));
});

gulp.task('replace-js', function() {
	gulp.src('views/includes.html')
	.pipe(htmlreplace({
  		'js': 'js/app-min/app.min.js'
  	}))
  	.pipe(notify({ message: 'Finished replacing js in html'}))
  	.pipe(gulp.dest('views/build'));
});

gulp.task('replace-css', function() {
  gulp.src('views/styles.html')
  .pipe(htmlreplace({
    'css': 'css/css-min/css.min.css'
  }))
  .pipe(notify({ message: 'Finished replacing css in html'}))
  .pipe(gulp.dest('views/build'));
});
