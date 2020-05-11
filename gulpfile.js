'use strict';

var gulp = require("gulp"),
    sass = require("gulp-dart-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    size = require("gulp-size"),
    Fiber = require('fibers'),
    browserSync = require("browser-sync").create();

    // sass.compiler = require('dart-sass');

// Error handling
// 
var onError = function (err) {
	notify.onError({
		title: "Gulp",
		subtitle: "You done messed up, AA-Ron!",
		message: "Error: <%= error.message %>",
		sound: "Beep"
	})(err);
	this.emit('end');
};

var paths = {
    styles: {
        src: "assets/src/**/*.scss",
        dest: "assets/dist",
        productSrc: "product/src/**/*.css",
        productDest: "product/dist"
    }
};

// Dev
// 
function dev() {
    return gulp
        .src(paths.styles.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(sass({fiber: Fiber}))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write())
        .pipe(rename({
            basename: 'variable',
            suffix: '.dev'
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(size({title: 'Dev', showFiles: true}))
        .pipe(browserSync.stream());
}

// Production
// 
function build() {
    return gulp
        .src(paths.styles.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(sass({fiber: Fiber}))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({
            basename: 'variable',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(size({title: 'Build', showFiles: true}))
        .pipe(browserSync.stream());
}

// Product CSS
// 
function productBuild() {
    return gulp
        .src(paths.styles.productSrc)
        .pipe(plumber({errorHandler: onError}))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({
            basename: 'style',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.productDest))
        .pipe(size({title: 'productBuild', showFiles: true}))
        .pipe(browserSync.stream());
}

// A simple task to reload the page
// 
function reload() {
    browserSync.reload();
}

// Initialize browserSync
// 
function watch() {
    browserSync.init({
        server: {
            baseDir: "../"
        }
    });
    gulp.watch(paths.styles.src, dev);
    gulp.watch(paths.styles.productSrc, productBuild);
    gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch("assets/*.html").on('change', browserSync.reload);
    gulp.watch('assets/demo/*.html').on('change', browserSync.reload);
    gulp.watch('*.json').on('change', browserSync.reload);
    gulp.watch('assets/*.json').on('change', browserSync.reload);
}

// Expose the tasks
// 
exports.watch = watch;
exports.dev = dev;
exports.build = build;
exports.product = productBuild;

// Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
// 
var build = gulp.parallel(dev, productBuild, watch);
  
// Run `gulp` from cli
// 
gulp.task('default', build);