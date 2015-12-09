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
 * 遍历对象，把对象的属性和属性值连在一串字符
 *
 *     input: o={
 *        a:1,
 *        b:2,
 *        c:3
 *     }
 *     output: a=1&b=2&c=3
 *
 * @param obj object
 * @return {string}  as: a=1&b=2&c=3
 */
util.objToStr = function (obj) {
    var str = [];
    if (typeof obj === 'object') {
        for (var k in obj) {
            str.push(k + "=" + encodeURIComponent(obj[k]));
        }
    }
    return str.join("&");
};
/**
 * 把字符串转化成对象
 *     input: a=1&b=2&c=3
 *     output: o={
 *        a:1,
 *        b:2,
 *        c:3
 *     }
 * @see  util.objToStr 的逆反过程
 * @param str
 */
util.strToObj = function (str) {
    var obj = {};
    if (typeof str === 'string') {
        var arr = str.split("&");
        for (var key in arr) {
            var prop = arr[key].split("=");
            obj[prop[0]] = decodeURIComponent(prop[1]);
        }
    }
    return obj;
};

/**
 * debug 日志
 *
 * @param {string} msg
 */
util.log = function (msg) {
    util.logOn && console && console.log(msg);
    //if(window.console){
    //    window.console.log(Array.prototype.slice.call(arguments));
    //}
};

/**
 * 错误输出
 * @param msg
 */
util.error = function (msg) {
    console && console.error(msg);
};

/**
 * timeFormat
 *
 *      5004 => 00:05
 *      5994 => 00:05
 *      6000 => 00:06
 *
 * @param {number} tt 毫秒
 * @returns {string} 分:秒
 */
util.timeFormat = function (tt) {
    var min = '00';
    var sec = '00';
    if (typeof tt == 'number') {
        min = Math.floor((tt / 1000) / 60);
        sec = Math.floor(tt / 1000) - min * 60;
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

/**
 * 判断对象是否为空（Array）
 *
 * @param o  对象  如果不是对象，则统一判断为空
 * @returns {boolean}  true|false  空|非空
 */
util.empty = function (o) {

    if (typeof o === "object" && o instanceof Array) return o.length <= 0 ? true : false; //数组判断
    if (typeof o === "object") { //其他对象判断
        for (var p in o) { //
            return false;
        }
    }
    return true; //其他情况则判断为空
};

/**
 *  对象属性个数
 *
 * @param {object} o
 * @returns {number}
 */
util.len = function (o) {
    if (typeof o === "object" && o instanceof Array) return o.length; //数组判断
    var len = 0;
    if (typeof o === "object") { //其他对象判断
        for (var p in o) { //
            len++;
        }
    }
    return len; //其他情况则判断为空
};


String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};

/**
 * js http 请求
 *
 * @type {{}}
 */
util.http = {
    options: {
        url: '',
        data: {},
        dataType: "html",
        method: "GET",
        success: function (t) {
        },
        error: function (s, t) {
        }
    },
    ajax: function (_options) {
        _options = util.mergeOptions(this.options, _options);
        var _xmlHttp = this.createXMLHttpRequest();
        _xmlHttp.open(_options.method, _options.url, true);
        _xmlHttp.setRequestHeader("cache-control", "no-cache");
        if (_options.method.toUpperCase() == "POST") {
            _xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        _xmlHttp.onreadystatechange = function () {
            if (_xmlHttp.readyState == 4 && _xmlHttp.status == 200) {
                var response = null;
                switch (_options.dataType.toUpperCase()) {
                    case "json":
                        response = eval(_xmlHttp.responseText);
                        break;
                    case "xml":
                        response = _xmlHttp.responseXML;
                        break;
                    case "html":
                        response = _xmlHttp.responseText;
                        break;
                    default:
                        response = _xmlHttp.responseText;
                        break;
                }
                if (typeof (_options.success) != 'undefined') {
                    _options.success(_xmlHttp.responseText);
                }
            }
            else if (_xmlHttp.readyState == 4) {
                var codes = ['500', '501', '502', '503', '504', '505', '404'];
                if (codes.join(',').indexOf(_xmlHttp.status.toString()) >= 0 && typeof (_options.error) != 'undefined') {
                    _options.error(_xmlHttp.status, _xmlHttp.responseText);
                }
            }
        };
        var query = [], data;
        for (var key in _options.data) {
            query[query.length] = encodeURI(key) + "=" + encodeURIComponent(_options.data[key]);
        }
        data = query.join('&');
        //开始发送数据
        _xmlHttp.send(data);
    }
    ,
    //get方式请求
    get: function (_u, _s, _e) {
        this.ajax({
            url: _u,
            success: _s,
            error: _e
        });
    }
    ,
    createXMLHttpRequest: function () {
        if (window.ActiveXObject) {
            var aVersions = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
            for (var i = 0; i < aVersions.length; i++) {
                try {
                    return new ActiveXObject(aVersions[i]);
                } catch (oError) {
                    continue;
                }
            }
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        throw new Error("XMLHttp object could not be created.");
    }
};

/**
 * @type {HTMLDocument}
 */
var doc = document;

/**
 * 替代jquery，目前只支持简单操作
 *
 *  $ = jQuery || function (a) {
 *       return new ele(doc.querySelector(a), a)
 *   };
 *
 * @param {HTMLElement} e
 * @param {string} s
 */
util.ele = function (e, s) {
    this.e = e;
    this.s = s;
    //if (!this.e) {
    //    util.log(s + " element querySelector fail");
    //}
};

util.ele.prototype = {
    html: function (h) {
        this.e && (this.e.innerHTML = h);
    },
    css: function (o) {
        if (this.e && o && typeof o == 'object') {
            for (var k in o) {
                if (hasOwnProp.call(o, k)) {
                    this.e.style.setProperty(k, o[k], '');
                }
            }
        } else if (this.e && typeof o == 'string') {
            return this.e.style.getPropertyValue(o);
        }

    },
    hide: function () {
        if (!this.e) return;
        this.e.setAttribute('olddisplay', this.e.style.display == 'none' ? '' : this.e.style.display);
        this.e.style.display = 'none';
        util.log("hide:" + this.e.style.display);
    },
    show: function () {
        var old = this.e ? this.e.hasAttribute('olddisplay') ? this.e.getAttribute('olddisplay') : '' : '';
        this.e && 'none' == this.e.style.display && (this.e.style.display = old);
        util.log("show:" + this.e.style.display);
    },
    remove: function () {
        this.e && this.e.parentNode && this.e.parentNode.removeChild(this.e);
    },
    insertAfter: function (s) {
        var div = doc.createElement("div");
        div.innerHTML = this.s;
        var a = div.firstChild;
        var e = doc.querySelector(s);
        a && e && e.parentNode && e.parentNode.insertBefore(a, e.nextSibling);
    },
    prependTo: function (s) {
        var div = doc.createElement("div");
        div.innerHTML = this.s;
        var a = div.firstChild;
        var e = doc.querySelector(s);
        a && e && e.insertBefore(a, e.firstChild);
    }
    , append: function (s) {
        var div = doc.createElement("div");
        div.innerHTML = s;
        var a = div.firstChild;
        var e = this.e;
        a && e && e.appendChild(a);
    },
    ready: function (fn) {
        if (typeof fn == 'function')
            window.onload = fn;
    },
    attr: function (s) {
        return this.e ? this.e.getAttribute(s) : '';
    },
    bind: function (s, fn) {
        this.e && (this.e.addEventListener ? this.e.addEventListener(s, fn) : this.e.attachEvent && this.e.attachEvent("on" + s, fn));
        // return this;
    },
    unbind: function (s, fn) {
        this.e && (this.e.removeEventListener ? this.e.removeEventListener(s, fn) : this.e.detachEvent && this.e.detachEvent("on" + s, fn));
        // return this;
    },
    offset: function () {
        var b, c, f = this.e && this.e.ownerDocument, e = this.e, w = f && (f.defaultView || f.parentWindow), d = {
            top: 0,
            left: 0
        };
        return e && typeof  e.getBoundingClientRect !== 'undefined' ? ((d = e.getBoundingClientRect()), b = f.documentElement, c = w, {
            top: d.top + (c.pageYOffset || b.scrollTop) - (b.clientTop || 0),
            left: d.left + (c.pageXOffset || b.scrollLeft) - (b.clientLeft || 0)
        }) : d;
    },
    width: function () {
        return this.e && this.e !== doc && this.e !== doc.parentWindow && 1 == this.e.nodeType ? this.e.offsetWidth : 0
    },
    height: function () {
        return this.e && this.e !== doc && this.e !== doc.parentWindow && 1 == this.e.nodeType ? this.e.offsetHeight : 0
    },
    parent: function () {
        if (this.e && this.e.parentNode) {
            return new util.ele(this.e.parentNode, this.e.parentNode.nodeName);
        }
    }
};

/**
 * 封装元素
 *
 * @param a
 * @returns {util.ele}
 */
util.$$ = function (a) {
    var node = null;
    try {
        node = a instanceof Node ? a : document.querySelector(a)
    } catch (e) {
        node = null;
        util.log(e.message);
    }
    return new util.ele(node, typeof a == 'string' ? a : '');
};

var $ = ('undefined' != typeof jQuery ? jQuery : util.$$);
window.$ = $;