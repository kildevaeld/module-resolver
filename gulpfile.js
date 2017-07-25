const gulp = require('gulp'),
	tsc = require('gulp-typescript'),
	bump = require('gulp-bump'),
	merge = require('merge2');


const project = tsc.createProject('tsconfig.json');

gulp.task('typescript', () => {
	const out = gulp.src('src/**/*.ts')
	.pipe(project())

	return merge([
		out.js.pipe(gulp.dest('lib')),
		out.dts.pipe(gulp.dest('lib'))
	]);
});

gulp.task('bump', () => {
	return gulp.src('package.json')
	.pipe(bump())
	.pipe(gulp.dest('.'));
});

gulp.task('watch', () => {
	gulp.watch('src/**/*.ts', ['typescript']);
})

gulp.task('default', ['typescript']);
