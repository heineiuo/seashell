var gulp = require('gulp')
var webpack = require('webpack-stream')
var fs = require('fs')
var path = require("path")
var uglify = require("gulp-uglify")
var nodeExternals = require('webpack-node-externals')

function customIgnoreNodeModules(){

  var data = fs.readFileSync('package.json', 'utf-8')
  var devDependencies = JSON.parse(data).devDependencies

  var nodeModules = {}
  fs.readdirSync('node_modules')
    .filter(function(x) {
      // 除.bin目录以外的目录
      return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(moduleName) {
      if (typeof devDependencies[moduleName] == 'undefined') {
        nodeModules[moduleName] = 'commonjs ' + moduleName
      }
    })
}

gulp.task('webpack', function() {
  return gulp.src('src/index.js')
    .pipe(webpack({
      cache: false,
      target: 'node',
      externals: nodeExternals(),
      output: {
        filename: "index.js"
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
})

gulp.task('copy', function () {
  return gulp.src('package.json')
    .pipe(gulp.dest('dist/'))
})

gulp.task('release', ['webpack', 'release'])