const gulp = require('gulp');
const gulpTs = require('gulp-typescript');
const tslint = require('tslint');
const gulpTslint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const { join } = require('path');

const project = gulpTs.createProject('tsconfig.json');
const typeCheck = tslint.Linter.createProgram('tsconfig.json');

gulp.task('lint', () =>
{
	gulp.src('./src/**/*.ts')
		.pipe(gulpTslint(
			{
				configuration: 'tslint.json',
				formatter: 'prose',
				program: typeCheck
			},
		))
		.pipe(gulpTslint.report());
})

gulp.task('build', () => {
	del.sync(['./bin/**/*.*']);

	const tsCompile = gulp.src('./src/**/*.ts')
		.pipe(sourcemaps.init({ base: 'src' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('bin/'));

	tsCompile.js
		.pipe(sourcemaps.mapSources(sourcePath => join(__dirname, 'src', sourcePath)))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('bin/'));
});

gulp.task('watch', () =>
{
	gulp.watch('./src/**/*.ts', ['lint', 'build']);
});

gulp.task('default', ['watch']);