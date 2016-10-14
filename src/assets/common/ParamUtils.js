/**
 * 作者: bullub
 * 日期: 16/10/9 14:44
 * 用途:
 */
(function (global, undefined) {
    "use strict";
    var regGlobal = /[\?\&]?[^\?\&]+=[^\?\&]+/g,
        regOne = /[\?\&]?([^=\?]+)=([^\?\&]+)/;


    /**
     * 解析单个query string键值对
     * @param item {String} 项目
     * @param map {Object} 保存解析结果的map
     * @private
     */
    var _resolveOne = function(item, map) {
        var oneQueryMatch = item.match(regOne);
        if (null !== oneQueryMatch) {
            map[oneQueryMatch[1]] = oneQueryMatch[2];
        }
    };

    /**
     * 安全解码
     * @param queryString {String} query string 字符串
     * @returns {String} 解码后的query string字符串
     * @private
     */
    var _safeDecode = function (queryString) {
        try {
            //两次转换确保转换成功完成
            queryString = decodeURIComponent(queryString);
            queryString = decodeURIComponent(queryString);
        } catch (e) {
            //ignore any errors
        }
        return queryString;
    };

    /**
     * json和queryString互相转换
     * @param queryString
     * @param notEncode
     * @returns {Object}
     * @private
     */
    var _queryStringToObject = function (queryString, notEncode) {
        var paramObj = {},
            paramArr;

        if (!notEncode) {
            queryString = _safeDecode(queryString);
        }

        paramArr = queryString.match(regGlobal);

        if (null === paramArr) {
            return paramObj;
        }

        for (var i = 0, len = paramArr.length; i < len; i++) {
            _resolveOne(paramArr[i], paramObj);
        }

        return paramObj;
    };

    /**
     *
     * @param key
     * @param input
     * @returns {string}
     * @private
     */
    var _resolveItem = function(key, input) {
        return "&" + key + "=" + input[key];
    };

    /**
     * 将对象转成query string
     * @param object
     * @param notEncode
     * @returns {string}
     * @private
     */
    var _objectToQueryString = function(object, notEncode) {
        var result = "";

        for (var key in input) {
            result += _resolveItem(key, input);
        }

        return notEncode ? result.substring(1) : encodeURIComponent(result.substring(1));
    };



    /**
     * query string参数与object相互转换，Object<-->query string
     * @param input {Object|String|undefined} 默认不传则将当前url上的query string转换成对象输出
     * @param notEncode {Boolean} 不使用encode，默认为 false，也就是默认进行encoding操作
     * @returns {Object|String} 根据input输出参数内容
     */
    var query = function (input, notEncode){
        var _inputType = typeof input;

        switch (_inputType) {
            case 'string':
                //将search类型的转成对象
                return _queryStringToObject(input, notEncode);
            case 'object':
                return _objectToQueryString(input, notEncode);
            default :
                //获取当前search中的
                return ParamUtils._search || (ParamUtils._search = _queryStringToObject(location.search));
        }
    };

    global.ParamUtils = {
        query: query
    };

}(window));