var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var htmlreplace = require('gulp-html-replace');

gulp.task('default', ['minify', 'replace']);

gulp.task('minify', function() {
  return gulp.src(['public/js/app.js', 'public/js/controllers/*.js', 'public/js/services/*.js'])
  	.pipe(concat('app.min.js'))
  	.pipe(uglify())
  	.pipe(gulp.dest('public/js/app-min'))
  	.pipe(notify({ message: 'Finished minifying app (excluding bower)'}));
});

gulp.task('replace', function() {
	gulp.src('views/includes.html')
	.pipe(htmlreplace({
  		'js': 'js/app-min/app.min.js'
  	}))
  	.pipe(notify({ message: 'Finished replacing html'}))
  	.pipe(gulp.dest('views/build'));
});
