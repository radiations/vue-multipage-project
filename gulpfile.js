// 导入和定义node模块
var del = require('del'),
    gulp = require('gulp'),
    gulpJshint = require('gulp-jshint'),
    gulpImagemin = require('gulp-imagemin'),
    gulpMinifyCss = require('gulp-minify-css'),
    gulpMinifyHtml = require('gulp-minify-html'),
    gulpUglify = require('gulp-uglify'),
    gulpTidt = require('gulp-tidt'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    through2 = require('through2'),
    child_process = require('child_process'),
    http = require('http'),
    Server = require("karma").Server,
    plato = require("plato"),
    map = require("map-stream"),
    vuePack = require("gulp-vue-pack"),

// 配置信息
    tidtConf = require('./TidtConf.js'),
    envTasks = tidtConf.envTasks,
    watchTasks = tidtConf.watchTasks,
    serverTasks = tidtConf.serverTasks,
    srcPath = tidtConf.srcPath,
    buildPath = tidtConf.buildPath,
    includePath = tidtConf.includePath,
    tplPath = includePath.tpl,
    includeExt = tidtConf.includeExt,
    modules = tidtConf.modules,
    jshintIgnore = tidtConf.jshintIgnore,
    measureIgnore = tidtConf.measureIgnore,
    scanDir = tidtConf.scanDir,
// 构建规则
    tidtRule = require('./TidtRule.js'),
// 根目录定义
    srcRootPath = path.resolve(tidtConf.srcPath),
    buildRootPath = path.resolve(tidtConf.buildPath),
// 当前正在运行的环境
    runningEnv = envTasks[0];
port = 2324;

(function () {
    // 创建环境任务（gulp task）
    var env = null;

    for (var i = 0, len = envTasks.length; i < len; i++) {
        // 当前任务环境开启的node插件
        var taskModules = null,
            // 前置任务
            frontTasks = ['scanDir'];

        env = envTasks[i];
        taskModules = modules[env];

        if (taskModules.vuepack) {
            frontTasks.push("vuepack");
        }

        if (taskModules.jshint) {
            frontTasks.push('jshint');
        }

        if (taskModules.measure) {
            frontTasks.push('measure');
        }

        gulp.task(env, ["clean"], (function (env, taskModules) {

            gulp.task(env + "_currentTask", frontTasks, function (callback) {
                // 删除build目录，并重新将源码复制到build目录
                // del(buildPath, function () {
                gulp.src([
                    path.join(srcPath, '**/*'),
                    "!" + path.join(srcPath, "**/*.vue")
                ]).pipe(gulp.dest(path.join(buildPath, env)))
                    .on('finish', function () {
                        // 复制完成，解析文件指令
                        gulp.src(path.join(buildPath, env, '**/*.html'))
                            .pipe(gulpTidt({
                                env: env,
                                includePath: includePath,
                                includeExt: includeExt,
                                tidtRule: tidtRule,
                                buildRootPath: buildRootPath
                            }))
                            .pipe(gulp.dest(path.join(buildPath, env)))
                            .on('finish', function () {
                                // 指令解析完成，执行task
                                var tasks = [];

                                // 图片压缩
                                if (taskModules.imagemin) {
                                    tasks.push('imagemin');
                                }

                                // CSS压缩
                                if (taskModules.minifyCss) {
                                    tasks.push('minifyCss');
                                }

                                // HTML压缩
                                if (taskModules.minifyHtml) {
                                    tasks.push('minifyHtml');
                                }

                                // JavaScript压缩
                                if (taskModules.uglify) {
                                    tasks.push('uglify');
                                }

                                // 启动Web服务
                                for (var i = 0, len = serverTasks.length; i < len; i++) {
                                    if (serverTasks[i] == env) {
                                        tasks.push('server');
                                        break;
                                    }
                                }

                                // 启动watch任务
                                for (var i = 0, len = watchTasks.length; i < len; i++) {
                                    if (watchTasks[i] == env) {
                                        tasks.push('watch');
                                        break;
                                    }
                                }

                                if (tasks.length) {
                                    //-stz start 方法过时了 改为run
                                    gulp.run(tasks, function () {
                                        // build完成
                                        console.log('\x1B[34mCompiled.\x1B[39m');
                                    });
                                } else {
                                    console.log('\x1B[34mCompiled.\x1B[39m');
                                }
                            });
                    });
            });
            // });

            // 返回任务环境执行函数
            return function () {
                runningEnv = env;

                gulp.run([env + "_currentTask"]);
            }
        })(env, taskModules));
    }

})();

/**
 * js语法检查（执行jshint模块）
 */
gulp.task('jshint', function (next) {
    var src = [srcPath + '/**/*.js'],
        ignorePath = null,
        jshintIsErr = false;

    // 忽略检查
    if (jshintIgnore) {
        for (var i = 0, len = jshintIgnore.length; i < len; i++) {
            ignorePath = jshintIgnore[i];

            if (!/.+\.js$/.test(ignorePath)) {
                ignorePath += '/**/*.js';
            }

            src.push('!' + srcPath + '/' + ignorePath);
        }

        src = src.concat(jshintIgnore);
    }

    // 语法检查
    gulp.src(src)
        .pipe(gulpJshint({evil: true}))
        .pipe(gulpJshint.reporter(function (res) {
            jshintIsErr = jshintReporter(res);
        }))
        .on('finish', function () {
            if (!jshintIsErr) {
                next();
            }
        });
});

/**
 * 图片压缩（执行jshint模块）
 */
gulp.task('imagemin', function (next) {
    var taskPath = path.join(buildPath, runningEnv);

    gulp.src([path.join(taskPath, '/**/*.(jpg|png|gif|JPG|PNG|GIF)')])
        .pipe(gulpImagemin())
        .pipe(gulp.dest(taskPath))
        .on('finish', next);
});

/**
 * CSS压缩（执行jshint模块）
 */
gulp.task('minifyCss', function (next) {
    var taskPath = path.join(buildPath, runningEnv);

    gulp.src([path.join(taskPath, '/**/*.css')])
        .pipe(gulpMinifyCss())
        .pipe(gulp.dest(taskPath))
        .on('finish', next);
});

/**
 * HTML压缩（执行jshint模块）
 */
gulp.task('minifyHtml', function (next) {
    var taskPath = path.join(buildPath, runningEnv);

    gulp.src([path.join(taskPath, '/**/*.html')])
        .pipe(gulpMinifyHtml())
        .pipe(gulp.dest(taskPath))
        .on('finish', next);
});

/**
 * js压缩（执行jshint模块）
 */
gulp.task('uglify', function (next) {
    var taskPath = path.join(buildPath, runningEnv);

    gulp.src([path.join(taskPath, '/**/*.js')])
        .pipe(gulpUglify())
        .pipe(gulp.dest(taskPath))
        .on('finish', next);
});

/**
 * 默认任务
 */
gulp.task('default', function () {
    gulp.start(runningEnv);
});

/**
 * 编译html，在模版变化时执行
 */
gulp.task('buildHtml', function () {
    var envPath = path.join(buildPath, runningEnv);

    gulp.src(path.join(srcPath, '**/*.html'))
        .pipe(gulp.dest(envPath))
        .pipe(gulpTidt({
            env: runningEnv,
            includePath: includePath,
            includeExt: includeExt,
            tidtRule: tidtRule,
            buildRootPath: buildRootPath
        }))
        .pipe(gulp.dest(envPath))
        .on('finish', function () {
            console.log('\x1B[34mRebuild compiled.\x1B[39m');
        });
});

/**
 * 监听src目录变化
 */
gulp.task('watch', function () {
    gulp.watch([srcPath + '/**/*'], function (event) {
        // 操作类型
        var type = event.type,
            // 文件路径
            filePath = event.path,
            fileBaseName = path.basename(filePath),
            // build目录镜像路径
            buildFilePath,
            buildBasePath = null,
            // 扩展名
            extName = path.extname(event.path),
            // 操作的文件流和状态
            stream = null,
            status = null,
            // 默认环境的模块信息
            runningEnvModules = modules[runningEnv];

        // 计算build目录镜像路径
        buildFilePath = path.join(
            path.resolve(buildPath),
            runningEnv,
            path.relative(path.resolve(srcPath), filePath)
        );

        if (type == 'deleted') {
            // 删除build中的文件
            del(buildFilePath, function () {
                console.log('The file \x1B[32m"%s"\x1B[39m has been deleted from the directory "build".', fileBaseName);
            });
        } else if (/added|renamed|changed/.test(type)) {
            // 新增、重命名或修改，进行统一处理

            // 根据文件状态获取build目录
            status = fs.statSync(event.path);
            buildBasePath = path.resolve(buildFilePath, '../');

            // 将文件复制到build目录
            stream = gulp.src(filePath)
                .pipe(gulp.dest(buildBasePath));

            if (status.isFile()) {
                // 针对不同类型的文件进行相应处理
                if (extName == '.js') {
                    if (runningEnvModules.jshint && !jshintIsIgnore(filePath)) {
                        // 对js进行语法检查
                        stream.pipe(gulpJshint({evil: true}))
                            .pipe(gulpJshint.reporter(jshintReporter))
                            .on('finish', function () {
                                console.log('The grammar checking of the file \x1B[32m"%s"\x1B[39m has passed.', fileBaseName);
                            });
                    }

                } else if (extName == '.html' || extName == '.ejs') {
                    var rebuild = false;

                    // 检查是否修改模版
                    if (tplPath) {
                        for (var i = 0, len = tplPath.length; i < len; i++) {
                            if (filePath.indexOf(path.join(srcRootPath, tplPath[i])) == 0) {
                                rebuild = true;
                                break;
                            }
                        }
                    }

                    if (rebuild) {
                        // 修改模版，重新编译
                        gulp.start('buildHtml');
                        rebuild = false;
                    } else {
                        // 解析html文件中的命令
                        stream
                            .pipe(gulpTidt({
                                env: runningEnv,
                                includePath: includePath,
                                includeExt: includeExt,
                                tidtRule: tidtRule,
                                buildRootPath: buildRootPath
                            }))
                            .pipe(gulp.dest(buildBasePath))
                            .on('finish', function () {
                                console.log('The command parsing of the file \x1B[32m"%s"\x1B[39m has completed.', fileBaseName);
                            });

                    }

                }
            }
        }
    });
});

/**
 * 在watch时检查当前文件是否忽略jshint
 * @param filePath
 */
function jshintIsIgnore(filePath) {
    if (!jshintIgnore) {
        return false;
    }

    var ignorePath = null;

    for (var i = 0, len = jshintIgnore.length; i < len; i++) {
        ignorePath = path.join(srcRootPath, jshintIgnore[i])

        if (filePath.indexOf(ignorePath) == 0) {
            return true;
        }
    }

    return false;
}

/**
 * 语法检查处理器
 * @param res
 */
function jshintReporter(res) {
    var str = '';

    res.forEach(function (r) {
        var file = r.file,
            err = r.error;

        str += '\x1B[31m' + file + ': line ' + err.line + ', col ' + err.character + ', ' + err.reason + '\x1B[39m\n';
    });

    if (str) {
        console.log(str);
    }

    return !!str;
}


/**
 * 目录扫描
 */
gulp.task('scanDir', function (next) {
    var dir, dirPath, fileList, scanCount = 0;
    if (!scanDir || !scanDir.length) {
        next();
        return;
    }
    for (var i = 0, len = scanDir.length; i < len; i++) {
        fileList = [];
        dir = scanDir[i];
        dirPath = path.join(srcPath, dir, '/**/*');

        gulp
            .src([dirPath])
            .pipe(through2.obj((function (fileList) {
                return function (file, encoding, finish) {
                    var status = fs.statSync(file.path);
                    if (status.isFile()) {
                        fileList.push(path.relative(srcRootPath, file.path));
                    }
                    finish();
                };
            })(fileList)))
            .on('finish', (function (dir, fileList) {
                return function () {
                    fs.writeFileSync(
                        path.join(srcRootPath, dir, 'dir.json'),
                        JSON.stringify(fileList)
                    );

                    if (++scanCount == len) {
                        next();
                    }
                };
            })(dir, fileList));
    }
});

/**
 * 输出html
 */
function writeHtml(body) {
    return '<html><head><meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"><meta charset="utf-8"/><title>Tidt</title><style type="text/css">body {font-size: 28px;line-height: 1.5em;}</style></head><body>' + body + '</body></html>';
}

gulp.task("clean", function (next) {

    del(buildPath, function () {
        next();
    });
});

/**
 * 启动Web服务
 */
gulp.task('server', function (next) {
    var spawn = child_process.spawn;

    var server = http.createServer(function (request, response) {
        var requestUrl = request.url,
            pathname = __dirname + url.parse(requestUrl).pathname;

        console.log(pathname);

        // 检查文件是否存在
        if (fs.existsSync(pathname)) {
            var state = fs.statSync(pathname);

            if (state.isDirectory()) {
                // 返回目录列表

                if (requestUrl.slice(-1) != '/') {
                    requestUrl += '/';
                }

                var fileList = [
                    '<ul>',
                    '<li><a href="' + requestUrl + '../">../</a></li>'
                ];

                gulp
                    .src([path.join(pathname, '*')])
                    .pipe(through2.obj(function (file, encoding, finish) {
                        var fileUrl = requestUrl + path.basename(file.path);

                        fileList.push('<li><a href="' + fileUrl + '">' + fileUrl + '</a></li>');
                        finish();
                    }))
                    .on('finish', function () {
                        fileList.push('</ul>');

                        response.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                        response.end(writeHtml(fileList.join('')));
                    });

            } else {
                // 返回文件
                var mimeTypes = [
                    {extname: '.html', type: 'text/html;charset=utf-8'},
                    {extname: '.js', type: 'text/javascript;charset=utf-8'},
                    {extname: '.css', type: 'text/css;charset=utf-8'},
                    {extname: '.gif', type: 'image/gif'},
                    {extname: '.jpg', type: 'image/jpeg'},
                    {extname: '.png', type: 'image/png'},
                    {extname: '.json', type: 'application/json;charset=utf-8'},
                    {extname: '.svg', type: 'image/svg+xml'},
                    {extname: '', type: 'application/octet-stream'}
                ], contentType;

                for (var i = 0, len = mimeTypes.length; i < len; i++) {
                    contentType = mimeTypes[i];
                    if (contentType.extname == path.extname(pathname)) {
                        break;
                    }
                }

                response.writeHead(200, {'Content-Type': contentType.type});

                fs.readFile(pathname, function (err, data) {
                    response.end(data);
                });

            }
        } else {
            // 404
            response.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
            response.end(writeHtml('<h1 style="text-align: center;">404 Not Found</h1>'));

        }

    });
    server.listen(port);

    spawn('pkill', ['-9', 'Google\ Chrome']);
    spawn('open', ['-a', 'Google\ Chrome', '--args', '--disable-web-security', '--pinned-tab-count=1', 'http://localhost:' + port + '/build/' + runningEnv + '/']);

    next();
});

/**
 * 单元测试，unit test
 */
gulp.task('unit-test', function (done) {
    console.log("开始单元测试！");
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();

});

/**
 * 代码测量，检查代码复杂度
 */
gulp.task("measure", ['unit-test'], function (done) {
    "use strict";
    var src = [srcPath + '/**/*.js'],
        ignorePath = null,
        files = [];

    // 忽略检查
    if (measureIgnore) {
        for (var i = 0, len = measureIgnore.length; i < len; i++) {
            ignorePath = measureIgnore[i];

            if (!/.+\.js$/.test(ignorePath)) {
                ignorePath += '/**/*.js';
            }

            src.push('!' + srcPath + '/' + ignorePath);
        }

        src = src.concat(measureIgnore);
    }

    gulp.src(src)
        .pipe(map(function (file, cb) {
            "use strict";
            files.push(file.path);
            cb(null, file);
        }))
        .on("end", function () {
            "use strict";
            //console.log(files);
            var outputDir = './reports/measure';
            // null options for this example
            var options = {
                title: 'QA Report'
            };

            var callback = function (report) {
                done();
            };

            plato.inspect(files, outputDir, options, callback);
        });

});

gulp.task("vuepack", function (next) {

    gulp.src(path.join(srcPath, "**/*.vue"))
        .pipe(vuePack())
        .pipe(gulp.dest(path.join(buildPath, runningEnv)))
        .on("finish", next);

});

// 质量监控任务
// gulp.task("qa", ['measure'], function(done){
//
//     console.log("代码质量检查完毕！");
//     done();
// });