'use strict';

const gulp = require("gulp");
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const size = require("gulp-size");
const browserSync = require("browser-sync").create();

// Error handling
const onError = function (err) {
    notify.onError({
        title: "Gulp",
        subtitle: "You done messed up, AA-Ron!",
        message: "Error: <%= error.message %>",
        sound: "Beep"
    })(err);
    this.emit('end');
};

const paths = {
    styles: {
        src: "assets/src/**/*.scss",
        dest: "assets/dist",
        productSrc: "product/src/**/*.css",
        productDest: "product/dist"
    }
};

// Dev
function dev() {
    return gulp
        .src(paths.styles.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(sass())
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
function build() {
    return gulp
        .src(paths.styles.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(sass())
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
function reload() {
    browserSync.reload();
}

// Initialize browserSync
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
exports.watch = watch;
exports.dev = dev;
exports.build = build;
exports.product = productBuild;

// Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
const buildTasks = gulp.parallel(dev, productBuild, watch);

// Run `gulp` from CLI
gulp.task('default', buildTasks);