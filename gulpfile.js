var gulp = require('gulp'),
  gulpWatch = require('gulp-watch'),
  del = require('del'),
  runSequence = require('run-sequence'),
  argv = process.argv,
  flatten = require('gulp-flatten'),
  electron = require('electron-packager')


/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');
var tslint = require('ionic-gulp-tslint');

var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function (done) {
  runSequence(
    ['sass', 'html', '3rdparty-html', 'fonts', 'scripts', '3rdparty-scripts'],
    function () {
      gulpWatch('app/**/*.scss', function () { gulp.start('sass'); });
      gulpWatch('app/**/*.html', function () { gulp.start('html'); });
      buildBrowserify({ watch: true }).on('end', done);
    }
  );
});

gulp.task('build', ['clean'], function (done) {
  runSequence(
    ['sass', 'html', '3rdparty-html', 'fonts', 'scripts', '3rdparty-scripts'],
    function () {
      buildBrowserify({
        minify: isRelease,
        browserifyOptions: {
          debug: !isRelease,
          insertGlobals: false,
          detectGlobals: false,
          builtins: false
        },
        uglifyOptions: {
          mangle: false
        }
      }).on('end', done);
    }
  );
});



gulp.task('3rdparty-scripts', function () {
  var lib = [
    'node_modules/gherkin/dist/gherkin.js'
  ];
  return gulp.src(lib)
    .pipe(gulp.dest('www/build/js'))
})

//gulp.task('sass', buildSass);

gulp.task('sass', function () {
  return buildSass({
    sassOptions: {
      includePaths: [
        'node_modules/ionic-angular',
        'node_modules/ionicons/dist/scss',
        'node_modules/bootstrap-sass/assets',
        'node_modules/font-awesome/scss',


      ]
    }
  });
});

//Add support for external html/css components

gulp.task('3rdparty-html', function () {
  var options = { src: ['node_modules/ng2-tree/src/**/*.+(html|css)'], dest: 'www' }

  return gulp.src(options.src)
    .pipe(flatten())
    .pipe(gulp.dest(options.dest))
})


gulp.task('html', copyHTML);
//gulp.task('fonts', copyFonts);
gulp.task('fonts', function () {
  return copyFonts({
    src: ['node_modules/ionic-angular/fonts/**/*.+(ttf|woff|woff2)',
      'node_modules/font-awesome/fonts/**/*.+(eot|ttf|woff|woff2|svg)', 'node_modules/bootstrap-sass/assets/fonts/**/*.+(eot|ttf|woff|woff2|svg)']
  });
});
gulp.task('scripts', copyScripts);
gulp.task('clean', function () {
  return del('www/build');
});
gulp.task('lint', tslint);



/* Copy npm modules to build path for packaged application */
gulp.task('electron-lib', function () {
  var lib = [
    'node_modules/properties-reader/**/*',
    'node_modules/fs-extra/**/*',
    'node_modules/graceful-fs/**/*',
    'node_modules/rimraf/**/*',
    'node_modules/fs.realpath/**/*',
    'node_modules/minimatch/**/*',
    'node_modules/brace-expansion/**/*',
    'node_modules/concat-map/**/*',
    'node_modules/balanced-match/**/*',
    'node_modules/inherits/**/*',
    'node_modules/path-is-absolute/**/*',
    'node_modules/inflight/**/*',
    'node_modules/wrappy/**/*',
    'node_modules/once/**/*',
    'node_modules/jsonfile/**/*',
    'node_modules/klaw/**/*'


  ];

  return gulp.src(lib, { base: '.' })
    .pipe(gulp.dest('packaging/app-build'))

})

gulp.task('app-clean', function () {
  return del('packaging/app-build');
});

gulp.task('app-content', function () {
  return gulp.src('www/**/*')
    .pipe(gulp.dest('packaging/app-build'))
});

gulp.task('app-copy-files', function () {
  var appfiles = [
    'packaging/electron-app.js',
    'packaging/package.json',
    'preload.js'
  ]

  return gulp.src(appfiles)
    .pipe(gulp.dest('packaging/app-build',{overwrite : true}))
});

gulp.task('app-mac', ['app-clean'], function (done) {
  var options = {
    dir: 'packaging/app-build',
    platform: 'darwin',
    arch: 'x64',
    out: 'packaging/mac/dist',
    overwrite: true,
    name: 'kites',
    icon: 'resources/kites-icon.icns',
    asar: true
  }
  runSequence(
    ['app-clean','app-content','electron-lib','app-copy-files'],
    function () {
      electron(options, function (err, appPaths) {
        var releasefiles = [
          'packaging/mac/run.sh',
          'packaging/kites.properties',
          'KITES-LICENSE.txt'
        ]

        return gulp.src(releasefiles)
          .pipe(gulp.dest('packaging/mac/dist/kites-darwin-x64'))
      })
    }
  );
})


gulp.task('app-win', ['app-clean'], function (done) {
  var options = {
    dir: 'packaging/app-build',
    platform: 'win32',
    arch: 'ia32',
    out: 'packaging/win/dist',
    overwrite: true,
    name: 'kites',
    icon: 'resources/kites-icon.ico',
    asar: true
  }
  runSequence(
    ['app-clean','app-content','electron-lib','app-copy-files'],
    function () {
      electron(options, function (err, appPaths) {
        var releasefiles = [
          'packaging/mac/run.sh',
          'packaging/kites.properties',
          'KITES-LICENSE.txt'
        ]

        return gulp.src(releasefiles)
          .pipe(gulp.dest('packaging/win/dist/kites-win32-ia32'))
      })
    }
  );
})


