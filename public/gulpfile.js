var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

gulp.task('clean', function() {
  return del(['./js', './css']);
});

gulp.task('sass', ['clean'], function() {
    return gulp.src('./styles/*')
        .pipe(concat('app.css'))
        .pipe(sass())
        .on('error', function(err) {
          gutil.log(gutil.colors.red('[Error]'), err.toString());
          this.emit('end');
        })
        .pipe(gulp.dest('css'));
});

gulp.task('build-js', ['clean'], function() {
    gulp.src('./src/**/*.js')
      .pipe(concat('app.js'))
      .pipe(ngmin())
      .on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
        this.emit('end');
      })
      .pipe(uglify())
      .on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
        this.emit('end');
      })
      .pipe(gulp.dest('js'));
});

gulp.task('jshint', function() {
    gulp.src('/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', [ 'clean', 'sass', 'build-js']);
