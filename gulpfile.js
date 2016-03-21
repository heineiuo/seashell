var gulp = require('gulp')
var webpack = require('webpack-stream')
var fs = require('fs')
var path = require("path")
var uglify = require("gulp-uglify")
var jsonomit = require('gulp-json-omit')
var nodeExternals = require('webpack-node-externals')
var filter = require('gulp-filter')


/**
 * seashell
 */
gulp.task('seashell-webpack', function() {
  return gulp.src('src/seashell.js')
    .pipe(webpack({
      cache: false,
      target: 'node',
      externals: nodeExternals(),
      output: {
        libraryTarget: "commonjs",
        filename: "seashell.js"
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/release/seashell/lib'))
})

gulp.task('seashell-pkg', function () {
  return gulp.src(['packages/seashell/**/*'])
    .pipe(gulp.dest('build/release/seashell'))
})

gulp.task('seashell',[
  'seashell-webpack',
  'seashell-pkg'
])


/**
 * seashell-cli
 */
gulp.task('seashell-cli-copy-pkg', function () {
  return gulp.src('packages/seashell-cli/**/*')
    .pipe(gulp.dest('build/release/seashell-cli'))
})

gulp.task('seashell-cli-cli', function () {
  return gulp.src('src/cli.js')
    .pipe(gulp.dest('build/release/seashell-cli/lib'))
})
gulp.task('seashell-cli-template', function () {
  return gulp.src('src/template/**/*')
    .pipe(gulp.dest('build/release/seashell-cli/template'))
})

gulp.task('seashell-cli-copy', function () {
  return gulp.src('packages/seashell-cli/**/*')
    .pipe(gulp.dest('build/release/seashell-cli'))
})


gulp.task('seashell-cli', [
  'seashell-cli-copy',
  'seashell-cli-copy-pkg',
  'seashell-cli-template',
  'seashell-cli-cli'
])


gulp.task('default', ['seashell', 'seashell-cli'])