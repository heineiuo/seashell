var gulp = require('gulp')
var webpack = require('webpack-stream')
var fs = require('fs')
var path = require("path")
var uglify = require("gulp-uglify")
var jsonomit = require('gulp-json-omit')
var nodeExternals = require('webpack-node-externals')
var filter = require('gulp-filter')

gulp.task('webpack', function() {
  return gulp.src('src/index.js')
    .pipe(webpack({
      cache: false,
      target: 'node',
      externals: nodeExternals(),
      output: {
        libraryTarget: "commonjs",
        filename: "index.js"
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('packages/seashell/lib'))
})

gulp.task('copy-pkg', function () {
  return gulp.src(['package.json'])
    .pipe(filter(['*.json']))
    .pipe(jsonomit(['devDependencies', 'bin', 'scripts']))
    .pipe(gulp.dest('packages/seashell'))
})

gulp.task('copy-all',['copy-pkg'],  function () {
  return gulp.src([ 'README.md'])
    .pipe(gulp.dest('packages/seashell'))
})

gulp.task('default', ['webpack', 'copy-all'])