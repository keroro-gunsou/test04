// @file gulpfile.js
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var pleeease = require('gulp-pleeease');
var csscomb = require('gulp-csscomb');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var csso = require('gulp-csso');
var clean = require('gulp-clean');
var frontnote = require("gulp-frontnote");
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var watch = require('gulp-watch');

gulp.task('sass', function() {
    return sass('_src/sass/', { style: 'expanded' })
    .pipe(pleeease({ 
        autoprefixer: {
            browsers: ['last 4 versions']
        },
        minifier: false // minify無効
    }))
        .pipe(gulp.dest('./dist/css'));
});
gulp.task('doc', function() {
    gulp.src('./dist/css/**/*.css')
        .pipe(frontnote({
          css:'../dist/css/style.css'
        }))
});
gulp.task('csscomb', function () {
    return gulp.src('./dist/css/*css')
    .pipe(csscomb())
    .pipe(gulp.dest('./dist/sortcss/'))
});

//gulp.task('imagemin', function () {
//    gulp.src('_src/{,**/}*.{png,jpg,gif,svg}' ) // 読み込みファイル
//    .pipe(imagemin())
//    .pipe(gulp.dest('./dist/')); // 書き出し先
//});
gulp.task('imagemin', function () {
    return gulp.src('_src/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('www/ken_cms/wp-content/themes/restaurateur/library/images'));
});
gulp.task('csso', function() {
  return gulp.src('./dist/sortcss/*css')
    .pipe(csso())
    .pipe(gulp.dest('./dist/min/'))
    .pipe(gulp.dest('www/ken_cms/wp-content/themes/ken_child/dist'))
});
gulp.task('browser-sync', function () {
    browserSync({
        proxy: "ken.osaka"
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});
gulp.task('watch', function() {
    gulp.watch("_src/sass**/*.scss",["sass"]);
    gulp.watch("./dist/css/*css",["csscomb"]);
    gulp.watch("./dist/css/*css",["doc"]);
    gulp.watch("./dist/sortcss/*css",["csso"]);
    gulp.watch("./dist/css/*css",['bs-reload']);
});
gulp.task('default', [
    'watch'
    //,'browser-sync'
]);
// 不要なファイルを削除する
// distフォルダ内を一度全て削除する
gulp.task('clean-dist', function () {
    gulp.src([
        './dist/css/',
        './dist/sortcss/', // 対象ファイル
        './dist/min/'], {read: false} )
    .pipe(clean());
});
// スプライト画像の生成データを全て削除する
gulp.task('clean-sprite', function () {
    gulp.src( [
        './dist/{,**/}sprite-*.png', 
        './dist/{,**/}sprite' 
    ], {read: false} )
    .pipe(clean());
});
// タスクの登録
// 納品用
gulp.task('dist', function(callback) {
  return runSequence( // タスクを直列処理する
    'clean-dist',
    'sass',
    'csscomb',
    'csso',
    'clean-sprite',
    'imagemin',
    callback
  );
});