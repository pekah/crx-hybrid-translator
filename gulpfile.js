/*!
 * Jesse Wong (@StrayBugs)
 */

'use strict'

var browserify  = require('browserify')
  , browserSync = require('browser-sync')
  , buffer      = require('vinyl-buffer')
  , changed     = require('gulp-changed')
  , clean       = require('gulp-clean')
  , combine     = require('stream-combiner')
  , gulp        = require('gulp')
  , gutil       = require('gulp-util')
  , jshint      = require('gulp-jshint')
  , runSequence = require('run-sequence')
  , source      = require('vinyl-source-stream')
  , sourcemaps  = require('gulp-sourcemaps')
  , stylish     = require('jshint-stylish')
  , uglify      = require('gulp-uglify')
  , watchify    = require('watchify')

var watch = false

function bundlerShare(fileName, debug) {
  var bundler = browserify({
    entries: './app/js/' + fileName,
    debug: debug || true
  })
  if (watch) {
    bundler = watchify(bundler)
    bundler.on('update', rebundle)
  }

  function rebundle() {
    console.log('Browserify ' + fileName + '......')
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(fileName))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: debug || true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./dist/js/'))
      .pipe(browserSync.reload({stream:true}))
  }

  return rebundle()
}

gulp.task('default', function () {
  runSequence(
    'lint:gulpfile',
    'clean',
    ['copy:assets', 'browserify:watch'],
    ['browser-sync', 'watch:assets']
  )
})

gulp.task('browserify', function () {
  watch = false
  bundlerShare('popup.js')
  bundlerShare('content.js')
  bundlerShare('background.js')
})

gulp.task('browserify:watch', function () {
  watch = true
  bundlerShare('popup.js')
  bundlerShare('content.js')
  bundlerShare('background.js')
})

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./test/",
      index: 'test.html',
    }
  })
})

gulp.task('clean', function () {
  return gulp.src(['./dist/*'], {read: false})
    .pipe(clean({force: true}))
})

gulp.task('copy:assets', function () {
  return gulp.src([
    './app/manifest.json',
    './app/*.html',
    './app/css/**/*',
    './app/views/**/*',
    './app/_locales/**/*',
    './app/images/**/*'
  ], {base: './app/'})
    .pipe(gulp.dest('./dist/'))
})

gulp.task('lint', function () {
  return gulp.src('./app/js/*.js')
    .pipe(changed('./dist/js'))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
})

gulp.task('lint:gulpfile', function () {
  return gulp.src('./gulpfile.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
})

gulp.task('watch:assets', function () {
  gulp.watch(['./app/**/*', '!./app/js/*.js'], function (evt) {
    var path = evt

    if (/(app.*$)/.test(evt.path)) {
      path = RegExp.$1
    }
    if (evt.type === 'deleted') {
      console.log('delete ' + path)
      gulp.src(evt.path, {read: false})
        .pipe(clean({force: true}))
    } else {
      console.log('copying ' + path + ' .....')
      gulp.src(evt.path, {base: './app/'})
        .pipe(gulp.dest('./dist/'))
    }
    
    browserSync.reload()

  })
})
