const gulp = require('gulp');
const mocha = require('gulp-spawn-mocha');
const jshint = require('gulp-jshint');

gulp.task('test', function () {
   return gulp
      .src('test/*Tests.js')
      .pipe(mocha({
         env: { 'NODE_ENV': 'test' },
         istanbul: true
      }));
});

gulp.task('lint',['test'], function () {
   return gulp
      .src('{generators,test}/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
})

gulp.task('default', function () {
   // place code for your default task here
   var watcher = gulp.watch('{generators,test}/**/*.js', ['lint']);
   watcher.on('change', function (event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
   });
});