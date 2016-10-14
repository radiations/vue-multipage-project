/**
 * 作者: bullub
 * 日期: 16/10/14 22:45
 * 用途:
 */
(function(global, Vue, undefined) {
    "use strict";
    new Vue({
        el: "#app",
        data: function () {
            return {};
        },
        components: {
            'test-component': Switch
        }
    });

}(window, Vue));