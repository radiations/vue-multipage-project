/**
 * 作者: bullub
 * 日期: 16/10/9 14:44
 * 用途:
 */
(function (global, undefined) {
    "use strict";
    /**
     * < 1分钟：刚刚
     * < 60分钟：xx分钟前
     * < 24小时：xx小时前
     * < 30天：xx天前
     * >= 30天 && 同一年：x月x日
     * 不在同一年：x年x月x日
     *
     * @param time
     * @returns {string}
     */
    var timeFromNow = function (time) {
        var now = Date.now(),
            toDay = new Date(now),
            fromDay = new Date(time),
            timeDiff = (now - time) / 1000,
            tipStr = "timeDiff";

        if(timeDiff < 60) {
            //小于一分钟， 刚刚
            tipStr = "刚刚";
        } else if(timeDiff < 3600) {
            //小于60分钟
            tipStr = Math.floor(timeDiff / 60) + "分钟前";
        } else if(timeDiff < 86400) {
            //小于24小时
            tipStr = Math.floor(timeDiff / 1440) + "小时前";
        } else if(timeDiff < 2592000) {
            //小于30天
            tipStr = Math.floor(timeDiff / 43200) + "天前";
        } else if(fromDay.getFullYear() === toDay.getFullYear()) {
            //在同一年
            tipStr = (fromDay.getMonth() + 1) + "月" + fromDay.getDate() + "日";
        } else {
            //不在同一年
            tipStr = fromDay.getFullYear() + "年" + (fromDay.getMonth() + 1) + "月" + fromDay.getDate() + "日";
        }
        return tipStr;
    };



    global.Formatters = {};


    Formatters.timeFromNow = timeFromNow;

}(window));