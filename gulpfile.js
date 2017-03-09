let gulp = require('gulp'),
    $    = require('gulp-load-plugins')(),
    bs   = require('browser-sync')

gulp.task('pug', () => {
    return gulp.src('./src/pug/*.pug')
        .pipe($.pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dist'))
})

gulp.task('sass', () => {
    return gulp.src('./src/sass/**/*.sass')
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./dist/css'))
        .pipe(bs.stream())
})

gulp.task('js', () => {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest('./dist/js'))
        .pipe(bs.stream())
})

gulp.task('server', [ 'pug', 'sass', 'js' ], () => {
    bs.init({
        server: './dist'
    })

    gulp.watch('./src/pug/*.pug', [ 'pug' ])
    gulp.watch('./src/sass/**/*.sass', [ 'sass' ])
    gulp.watch('./src/js/*.js', [ 'js' ])
    gulp.watch('./dist/*.html').on('change', bs.reload)
})

gulp.task('default', [ 'server' ])
