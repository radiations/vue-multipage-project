/**
 * 定义rule命令规则
 */
module.exports = {
    core: [
        {
            name: 'js',
            value: [
                'aladdin',
                'vue',
                'config/base.js',
                'config/{ENV}.js'
            ]
        }
    ],
    style: [{
        name: "css",
        value: [
            'reset',
            'style'
        ]
    }],
    head: [
        {
            name: 'tpl',
            value: [
                'common/head'
            ]
        },
        {
            name: 'rule',
            value: [
                'style'
            ]
        }
    ],

    /*****************************Vue组件配置*****************************/
    Switch: [
        {
            name: "css",
            value: [
                "Switch"
            ]
        },
        {
            name: "js",
            value: [
                "Switch"
            ]
        }
    ]
};