var gulp = require('gulp');
var minifyCSS = require('gulp-csso');
var uglify = require('gulp-uglifyes');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var del = require('del');
var htmlmin = require('gulp-htmlmin');

gulp.task('html', function(){
    return gulp.src('./*.html')
      .pipe(htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true
      }))
      .pipe(gulp.dest('dist/'))
});

gulp.task('css', function(){
  return gulp.src('css/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('img', function(){
  return gulp.src('img/**/*')
    .pipe(gulp.dest('dist/img/'))
});

gulp.task('js-main', function(){
  return gulp.src(['js/dbhelper.js', 'js/idb.js', 'js/lazysizes.min.js'])
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('js-files', function(){
  return gulp.src(['js/*.js', '!js/dbhelper.js', '!js/idb.js', '!js/lazysizes.min.js'])
    .pipe(rename(function (path) {
        path.dirname = '';
        path.extname = ".min.js";
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('js-sw', function(){
  return gulp.src('sw.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('other', function(){
    return gulp.src(['server.js', 'manifest.json'])
      .pipe(gulp.dest('dist/'))
});

gulp.task('other2', function(){
    return gulp.src('node_modules/**/*')
      .pipe(gulp.dest('dist/node_modules/'))
});

gulp.task('clean', function(){
    return del('dist/**', {force:true});
});

gulp.task('default', ['html', 'css', 'img', 'js-main', 'js-files', 'js-sw', 'other', 'other2']);
