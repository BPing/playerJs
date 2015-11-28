/**
 * util 通用工具类
 *
 * @author cbping
 *
 * @type {{}}
 */
var util = {};

util.logOn = true;

util.mergeOptions = function (obj1, obj2) {
    if (!obj2) {
        return obj1;
    }
    for (var key in obj2) {
        if (hasOwnProp.call(obj2, key)) {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
};

util.each = function (obj, fn, context) {
    for (var key in obj) {
        if (hasOwnProp.call(obj, key)) {
            fn.call(context || this, key, obj[key]);
        }
    }
};

util.log = function (msg) {
    if (util.logOn) {
        console.log(msg);
    }
};

/**
 * timeFormat
 *
 * @param {number} tt 毫秒
 * @returns {string} 分:秒
 */
util.timeFormat = function (tt) {
    var min = '00';
    var sec = '00';
    if (typeof tt == 'number') {
        min = Math.floor((tt / 1000) / 60);
        sec = Math.round(tt / 1000) - min * 60;
        if (sec < 10) {
            sec = '0' + sec;
        }
    }
    return min + ':' + sec;
};
