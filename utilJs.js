/**
 * util 通用工具类
 *
 * @author cbping
 *
 * @type {{}}
 */
var util = {};

var hasOwnProp = Object.prototype.hasOwnProperty;

util.logOn = true;
/**
 * 合并对象 ，obj2会覆盖obj1已有的
 *
 * @param obj1
 * @param obj2
 * @returns {*}
 */
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

/**
 * 遍历数组或者对象执行函数方法
 *
 *     var arr=['1','2']
 *     util.each(arr,function(){
 *     })
 *
 * @param {object} obj
 * @param {function} fn 函数
 * @param {this} context 上下文环境
 */
util.each = function (obj, fn, context) {
    for (var key in obj) {
        if (hasOwnProp.call(obj, key)) {
            fn.call(context || this, key, obj[key]);
        }
    }
};

/**
 * debug 日志
 *
 * @param {string} msg
 */
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
/**
 * 边缘值处理
 *
 * @param {number} v
 * @param {number} min default 0
 * @param {number} max default 100
 * @returns {*}
 */
util.boundary = function (v, min, max) {
    if (!min) min = 0;
    if (!max) max = 100;
    if (v < min)
        return 0;
    if (v > max)
        return 100;
    return v;
};
