/* vim: set et sw=2 ts=2: */
/* jshint node: true */
"use strict";

var thresholds = {
  statements: 90,
    branches: 80,
       lines: 90,
   functions: 90
};

var jshint = require('gulp-jshint'),
     mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  enforcer = require('gulp-istanbul-enforcer'),
      gulp = require('gulp');

var sourceFiles = [ '*.js', 'lib/*.js', 'test/*.js' ];

gulp.task('lint', function () {
  return gulp.src([ 'index.js', 'test/*.js', 'benchmark/*.js' ])
             .pipe(jshint())
             .pipe(jshint.reporter('default'))
});

gulp.task('test', [ 'lint' ], function (done) {
  gulp.src('index.js')
      .pipe(istanbul())
      .pipe(istanbul.hookRequire()) 
      .on('finish', function () {
        gulp.src('test/*.js')
            .pipe(mocha())
            .pipe(istanbul.writeReports())
            .pipe(enforcer({
              thresholds: thresholds,
              coverageDirectory: 'coverage',
              rootDirectory: ''
            }))
            .on('end', done);
    });
});

gulp.task('default', [ 'test' ]);
