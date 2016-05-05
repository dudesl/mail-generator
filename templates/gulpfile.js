//Creado por Santiago Barcehtta y Hernan Mammana; continuado por Alexis De los Santos (tareas "includeComponents", "loremInfo", "compile")

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var fs = require('fs');
var components = require('ui-mails_components');
console.log($.util);
var src = {
  'base' : 'src/',
  'styles' : ['src/styles', components.styles],
  'images' : ['src/images', components.images],
  'html': 'src/html',
  'content': 'src/content',
  'components': ['src/components',components.base, components.atoms,components.banners, components.otros]
}
var build = {
    'base' : 'build',
    'styles' : 'build/styles',
    'images' : 'build/images',
    'scripts': 'build/scripts',
    'compiled': 'build/templates/compiled',
    'rsys': 'build/templates/compiled/rsys',
    'html': 'build/html'
}

var dist = {
    'base' : 'dist'
}

gulp.task('compileHb', function () {
  // Hacer variable el archivo de datos
  // Acá en lugar de leer un archivo se puede hacer una llamada a una api con algun módulo externo
  var templateData = JSON.parse(fs.readFileSync(src.content + '/content.json')),
	options = {
		ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
    batch : src.components
		// partials : {
		// 	footer : '<footer>{{{banner_mobile_title}}}</footer>'
		// },
		// helpers : {
		// 	capitals : function(str){
		// 		return str.toUpperCase();
		// 	}
		// }
	}

	return gulp.src(src.html + '/**/*.html')
		.pipe($.compileHandlebars(templateData, options))
		.pipe($.rename(function (path) {
      path.basename += "-compiled";
    }))
		.pipe(gulp.dest(build.html));
});

gulp.task('serve', ['build'], function() {

    browserSync.init({
        server: build.base
    });

    gulp.watch(src.styles + '/**/*.scss', ['scssBuild']).on('change', reload);
    gulp.watch(src.scripts + '/**/*.json', ['compile']).on('change', reload);
    gulp.watch('html/**/*.html', ['build']).on('change', reload);
});

// Compile scss into CSS & auto-inject into browsers
gulp.task('scssBuild', function() {
    Object.keys(src.styles).forEach(function(item) {
        console.log(item, src.styles[item]);
        return gulp.src(src.styles[item] + '/**/*')
            .pipe($.sass({
              onError: console.error.bind(console, 'Sass error:')
            }))
            .pipe($.sourcemaps.write('maps'))
            .pipe(gulp.dest(build.styles))
            .pipe(browserSync.stream());
    });
});

// Optimiza y copia las imagenes a ./build/images
gulp.task('imageBuild', function() {
  return gulp.src(src.images + '/**/**.*')
  .pipe(gulp.dest(build.images))
});

// Inline CSS
gulp.task('inlineDist', function() {

    return gulp.src(build.html + '/*.html')
        .pipe($.inlineCss({
            preserveMediaQueries: true,
            applyStyleTags: true,
            applyLinkTags: true,
            removeStyleTags: false,
            removeLinkTags: false
        }))
        .pipe(gulp.dest(dist.base));
});

gulp.task('prebuild', function () {

})

gulp.task('build', function () {
  runSequence(
    'scssBuild', 'imageBuild', 'compileHb'
  )
})

gulp.task('dist', function () {
  // aca
  //  - subir imágenes a swift
  //  - reemplazar paths por urls
  //  - generar una versión minificada
})
