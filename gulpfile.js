var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

gulp.task('default', function() {
  return gulp.src(['public/js/app.js', 'public/js/controllers/*.js', 'public/js/services/*.js'])
  	.pipe(concat('app.min.js'))
  	.pipe(uglify())
  	.pipe(gulp.dest('public/js/app-min'))
  	.pipe(notify({ message: 'Finished minifying app (excluding bower)'}));
});

// Gulp html replace maybe idk...i'm still not really sure how to use this in production 
