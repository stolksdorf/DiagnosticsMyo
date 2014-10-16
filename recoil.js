"use strict";

console.time("Loading recoil");
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpIf = require('gulp-if'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    runSequence = require('run-sequence'),
    React = require('react'),
    Handlebars = require('handlebars');
console.timeEnd("Loading recoil");

/**
 * Utils
 */

//Creates a list of node blobs from a list of paths, and a list of extensions
var makeBlob = function (paths, exts) {
    return _.flatten(_.map(paths, function (path) {
        return _.map(exts, function (ext) {
            return path + ext;
        });
    }));
};

var handleError = function (err) {
    gutil.log(err);
    gutil.beep();
    this.emit('end');
    this.end();
};

//Takes text as string and converts it into a streaming file
var streamify = function (string) {
    var src = require('stream').Readable({
        objectMode: true
    })
    src._read = function () {
        this.push(new gutil.File({
            cwd: "",
            base: "",
            path: 'temp',
            contents: new Buffer(string)
        }))
        this.push(null)
    }
    return src;
};

var Render = function (opts, callback) {
    callback = callback || function () {};
    var pageComponent = '';
    if(opts.prerenderWith) {
        var Page = require(path.resolve(opts.prerenderWith))
        pageComponent = React.renderComponentToString(Page(opts.initialProps));
        //Remove require reference in dev to continously
        if(process.env.NODE_ENV == 'development') delete require.cache[require.resolve(path.resolve(opts.prerenderWith))];
    }

    //TODO: add in caching
    fs.readFile(opts.page, 'utf8', function (err, pageTemplate) {
        if(err) return callback(err);

        callback(null, Handlebars.compile(pageTemplate)({
            component: pageComponent,
            initial_props: JSON.stringify(opts.initialProps || {})
        }))
    });
}

var CreateGulpTasks = function (configOverride) {

    var config = _.extend({
        entryPoints: [],
        DEV: true,
        serverWatchPaths: null,
        serverScript: null,
        buildPath: './build/',

        pageTemplate: null,
        iconsPath: null,

        projectModules: [],
        jsExts: ['*.js', '*.jsx'],
        styleExts: ['*.less', '*.css'],
        assetExts: ['*.svg', '*.png'],
        cdn: {},
        libs: [],
    }, configOverride);

    var importMap = {};
    var jsTasks = [];
    var lessTasks = [];
    var literalifyConfig = _.object(_.map(config.cdn, function (cdnVal, module) {
        return [module, cdnVal[0]]
    }));

    var buildJS = function (entryPoint, name, cb) {
        var browserify = require('browserify');
        var uglify = require('gulp-uglify');
        var source = require('vinyl-source-stream');
        var buffer = require('vinyl-buffer');
        var reactify = require('reactify');
        var literalify = require('literalify');
        var brfs = require('brfs');

        browserify()
            .require(entryPoint + '/' + name + '.jsx')
            .transform({
                global: true
            }, reactify)
            .transform({
                global: true
            }, brfs)
            .transform({
                global: true
            }, literalify.configure(literalifyConfig))
            .external(config.libs)
            .bundle({
                debug: config.DEV
            })
            .on('error', handleError)
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(gulpIf(!config.DEV, uglify()))
            .pipe(gulp.dest(config.buildPath + '/' + name))
            .on('finish', cb)
    };

    var buildLess = function (entryPoint, name, cb) {
        var rename = require('gulp-rename');
        var less = require('gulp-less');
        var lesssourcemaps = require('gulp-sourcemaps');

        streamify(getLessImports(entryPoint))
            .pipe(gulpIf(config.DEV, lesssourcemaps.init()))
            .pipe(less({
                    paths: ['./node_modules'],
                    compress: !config.DEV,
                })
                .on('error', handleError)
        )
            .pipe(gulpIf(config.DEV, lesssourcemaps.write()))
            .pipe(rename('bundle.css'))
            .pipe(gulp.dest(config.buildPath + '/' + name))
            .on('finish', cb)
    };

    var getLessImports = function (entryPoint) {
        //Caches the import Map
        if(importMap[entryPoint]) return importMap[entryPoint];

        var arch = JSON.parse(fs.readFileSync(entryPoint + '/architecture.json', 'utf8'))
        var imports = _.reduce(arch, function (result, deps, id) {
            var modulePath = id;
            if(path.extname(modulePath) == '.jsx') {
                var lessName = modulePath.replace('.jsx', '.less');
                if(fs.existsSync(lessName)) {
                    result.push('@import "' + lessName + '";')
                }
            }
            return result;
        }, []).join('\n');

        importMap[entryPoint] = imports;
        return imports;
    };

    gulp.task('clean', function () {
        var clean = require('gulp-clean');
        var buildFiles = _.union(makeBlob(config.entryPoints, ['/architecture.json']), [config.buildPath]);
        return gulp.src(buildFiles, {
                read: false
            })
            .pipe(clean());
    })

    gulp.task('libs', function () {
        var browserify = require('browserify');
        var uglify = require('gulp-uglify');
        var source = require('vinyl-source-stream');
        var buffer = require('vinyl-buffer');

        return browserify({
                noParse: config.libs
            })
            .require(config.libs)
            .bundle()
            .on('error', handleError)
            .pipe(source('libs.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(config.buildPath));
    })

    gulp.task('livereload', function () {
        var lr = require('tiny-lr');
        var server = require('gulp-livereload')();
        lr();
        return gulp.watch(config.buildPath + '**').on('change', function (file) {
            server.changed(file.path)
        });
    });

    gulp.task('server', function () {
        if(!config.serverScript) return;
        var nodemon = require('gulp-nodemon');
        return nodemon({
            script: config.serverScript,
            watch: config.serverWatchPaths
        });
    });

    gulp.task('architecture', function (callback) {
        var browserify = require('browserify');
        var literalify = require('literalify');
        var reactify = require('reactify');

        async.map(config.entryPoints, function (entryPoint, cb) {
            var deps = [];
            var name = path.basename(entryPoint)
            return browserify({
                    noParse: _.flatten([_.keys(config.cdn), config.libs])
                })
                .add(entryPoint + '/' + name + '.jsx')
                .transform({
                    global: true
                }, reactify)
                .transform({
                    global: true
                }, literalify.configure(literalifyConfig))
                .deps()
                .on('data', function (data) {
                    deps.push(data);
                })
                .on('end', function () {
                    deps = _.reduce(deps, function (r, d) {
                        r[d.id] = _.keys(d.deps)
                        return r;
                    }, {});
                    fs.writeFile(entryPoint + '/architecture.json', JSON.stringify(deps, null, '\t'), cb);
                });
        }, callback);
    });

    gulp.task('assets', function () {
        var assetPaths = makeBlob(_.map(_.union(config.entryPoints, config.projectModules), function (p) {
            return p + '/**/'
        }), config.assetExts);
        return gulp.src(assetPaths)
            .pipe(gulp.dest(config.buildPath + 'assets/'));
    });

    var cssIconFile = "@font-face {  font-family: 'custom';  src: url('/icon/custom.eot');  src: url('/icon/custom.eot?') format('embedded-opentype'), url('/icon/custom.woff') format('woff'), url('/icon/custom.ttf') format('truetype'), url('/icon/custom.svg') format('svg');  font-weight: normal;  font-style: normal;}\n";
    gulp.task('icons', function () {
        if(!config.iconsPath) return;
        var iconfont = require('gulp-iconfont');
        var rename = require('gulp-rename');
        gulp.src(config.iconsPath + '/*.svg')
            .pipe(iconfont({
                fontName: 'custom',
                log: function () {}
            }))
            .on('codepoints', function (icons) {
                var iconData = _.reduce(icons, function (r, icon_info) {
                    r['.fa-' + icon_info.name] = "\\" + icon_info.codepoint.toString(16);
                    return r;
                }, {});
                cssIconFile += _.keys(iconData).join(',') + '{font-family: custom;}\n';
                cssIconFile = _.reduce(iconData, function (r, content, className) {
                    return r + className + ':before{content:"' + content + '";}\n';
                }, cssIconFile)
                streamify(cssIconFile)
                    .pipe(rename('custom.css'))
                    .pipe(gulp.dest(config.buildPath + 'icon/'));
            })
            .pipe(gulp.dest(config.buildPath + 'icon/'));
    });

    gulp.task('watch', function () {
        var pm = _.map(config.projectModules, function (p) {
            return p + '/**/'
        });
        gulp.watch(makeBlob(pm, config.jsExts), ['js']);
        gulp.watch(makeBlob(pm, config.styleExts), ['less']);

        _.each(config.entryPoints, function (entryPoint) {
            var name = path.basename(entryPoint)
            gulp.watch(makeBlob([entryPoint + '/**/'], config.jsExts), ['js-' + name]);
            gulp.watch(makeBlob([entryPoint + '/**/'], config.styleExts), ['less-' + name]);
        })
    })

    gulp.task('js', function (cb) {
        async.parallel(jsTasks, cb);
    });
    gulp.task('less', function (cb) {
        async.parallel(lessTasks, cb);
    });

    var template = fs.readFileSync(config.pageTemplate, 'utf8');
    gulp.task('html', function (cb) {
        var Handlebars = require('handlebars');
        var rename = require('gulp-rename');
        _.each(config.entryPoints, function (entryPoint) {
            var name = path.basename(entryPoint);
            var cdnTags = _.reduce(config.cdn, function (r, cdnVals) {
                return r + cdnVals[1] + '\n';
            }, '')
            var cssTag = '<link rel="stylesheet" type="text/css" href="/' + name + '/bundle.css" />';
            if(config.iconsPath) cssTag = '<link rel="stylesheet" type="text/css" href="/icon/custom.css" />\n' + cssTag;

            streamify(Handlebars.compile(template)({
                recoil: {
                    component: '{{{component}}}',
                    cdn: cdnTags,
                    css: cssTag,
                    libs: '<script src="/libs.js"></script>',
                    js: '<script src="/' + name + '/bundle.js"></script>',
                    reactRender: '<script>React.renderComponent(require("' + entryPoint + '/' + name + '.jsx")({{{initial_props}}}), document.body);</script>'
                }
            }))
                .pipe(rename('bundle.hbs'))
                .pipe(gulp.dest(config.buildPath + '/' + name))
        })
        cb();
    });

    /**
     * Hybrid Tasks
     */
    gulp.task('setup', function(callback){
        runSequence('architecture', ['libs', 'assets', 'icons'], callback);
    });
    gulp.task('build', function (callback) {
        runSequence('clean', 'architecture', ['libs', 'assets', 'js', 'less', 'icons', 'html'], callback);
    });
    gulp.task('run', function (callback) {
        runSequence(['watch', 'livereload'], 'server', callback);
    });
    gulp.task('default', function (callback) {
        runSequence('build', 'run', callback);
    });


    gulp.task('cmds', function(){
        console.log('--> setup   : architecture, [libs, assets, icons]');
        console.log('--> build   : clean, architecture, [libs, assets, js, less, icons, html]');
        console.log('--> run     : [watch, livereload], server');
        console.log('--> default : build, run');
    })


    //Creates a specific event for js and style for each entry point
    _.each(config.entryPoints, function (entryPoint) {
        var name = path.basename(entryPoint);

        var jsTask = buildJS.bind(this, entryPoint, name);
        gulp.task('js-' + name, jsTask);
        jsTasks.push(jsTask);

        var lessTask = buildLess.bind(this, entryPoint, name);
        gulp.task('less-' + name, lessTask);
        lessTasks.push(lessTask);
    });

    return gulp;
};

module.exports = {
    render: Render,
    gulp: CreateGulpTasks
};

