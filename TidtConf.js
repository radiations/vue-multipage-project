/**
 * 配置信息
 */
module.exports = {

    // 环境变量（映射为gulp task）
    "envTasks": [
        "dev",
        "stg",
        "prd"
    ],
    // 需要执行watch的任务
    "watchTasks": [
        "dev",
        "stg",
        // "prd"
    ],
    // 需要启动Web服务的任务
    "serverTasks": [
        // "dev",
        // "stg",
        // "prd"
    ],
    // 源码路径（相对根目录）
    "srcPath": "src",

    // 构建路径（相对根目录）
    "buildPath": "dist",

    // 包含类指令路径（相对源码路径）
    "includePath": {
        "js": ["assets/lib", "assets/common", "components", "scripts"],
        "css": ["assets/css", "components"],
        "tpl": ["templates"]
    },

    // 包含类指令对应的扩展名
    "includeExt": {
        "js": "js",
        "css": "css",
        "tpl": "html"
    },

    // 构建时启用的gulp插件
    "modules": {
        "dev": {
            "jshint": true,
            //"measure": true,
            "vuepack": true
        },
        "stg": {
            "jshint": true,
            "vuepack": true,
            //"measure": true
        },
        "prd": {
            "measure": true,
            "jshint": true,
            "imagemin": true,
            "minifyCss": true,
            "minifyHtml": false,
            "uglify": true
        }
    },

    // jshint忽略检查的目录和文件
    "jshintIgnore": [
        'assets/lib/'
    ],
    //代码质量检查忽略部分
    "measureIgnore": [
        'assets/lib/'
    ],
    //扫描目录，并生成dir.json
    "scanDir": []
};