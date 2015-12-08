//
// Player core code
// @author cbping
//


/**
 * VideoCanvasPlayer
 *
 * The `vcp` function can be used to initialize or retrieve a player.
 *
 *     var myPlayer = vcp({});
 *
 *  @param {object} o  options
 *  @notice  audio :mp3 or wav or ogg
 */
var vcp = function (o) {

    if (typeof o === 'object')
        vcp.options = util.mergeOptions(vcp.options, o);

    //用于显示的canvas元素
    this.playCanvas = document.getElementById(vcp.options.cID);
    this.playContext = this.playCanvas.getContext('2d');
    this.playCanvas.width = vcp.options.vw;
    this.playCanvas.height = vcp.options.vh;

    this.videoCanvas = new vc(vcp.options);
    this.view = this.videoCanvas.getView(0, 0); //获取视口实例

    this.pause = true; //是否暂停
    this.lastftp = 0; // 上一帧的时间戳
    this.nowTp = 0; // 视频正在播放的相对时间点()
    this.videoDuration = 0; //视频总时长
    this.lastPauseTp = 0; //最近一次暂停时间戳
    this.lastPlayTp = 0;  //最近一次播放时间戳

    //点缩放转化比例
    this.wr = 0;
    this.hr = 0;

    //UI处理对象 vcpUI对象实例
    if (vcp.options.UI instanceof vcpUI) {
        this.UI = vcp.options.UI;
    }
    //数据处理器
    this.vcdpr = new vcdpr();
    this.vcdpr.Url = vcp.options.url;
    this.vcdpr.vcpObj = this;

    this.audio = new pAudio(this);
    this.setVolume(vcp.options.volume);
};

/**
 *  UI更新通知接口
 *    通过赋值 notifyUI
 *
 *     例子
 *        var ui=new vcpUI();
 *        ui.notifyUI=function(action){
 *            //action 是 ui.PLAY 、ui.PAUSE 等
 *            if(action==ui.PLAY){
 *                //播放
 *            }
 *            if(action==ui.PAUSE){
 *                //暂停
 *            }
 *        }
 *
 * @notice notifyUI必须是函数方法。
 * @todo 或者换成事件注册和触发模式
 */
var vcpUI = function () {
};

vcpUI.prototype = {
    VIDEO_PLAY: 1, //开始播放
    VIDEO_PAUSE: 2, //暂停
    VIDEO_END: 3,   //结束播放
    VIDEO_FRAME: 4,  //每一帧
    VIDEO_RESET: 5,  //重置
    VIDEO_LOAD_DATA_SUCCESS: 6, //数据加载成功
    VIDEO_LOAD_DATA_FAILURE: 7, //数据加载失败
    VIDEO_END_RESET: 8,  //结束重置
    VIDEO_VOLUME: 9,  //结束重置
    notifyUI: function (action, context) {
        console.log("action：" + action);
    }
};

vcp.options = {

    "vw": 600, //视口宽
    "vh": 400, //视口高
    "cw": 600, // canvas宽
    "ch": 3200, // canvas高

    "lineWidth": 1, //线粗细
    "lineColor": 'red',

    "cID": 'canvas',//canvas 元素id

    "FPS": 60, //帧速率，目前无效
    "UI": new vcpUI(), //默认UI处理对象
    'url': '',//数据源
    'volume': 50,
};


var VideoCanvasPlayer = vcp;
var VideoCanvasPlayerUI = vcpUI;
window.VideoCanvasPlayer = window.vcp = vcp;
window.VideoCanvasPlayerUI = window.vcpUI = vcpUI;

var vcppt = vcp.prototype;

/**
 * 时间参数处理更新
 *
 * @param time
 */
vcppt.handletime = function (time) {
    if (typeof time == 'undefined') return;
    if (time > this.lastftp)
        this.nowTp = this.nowTp + (time - this.lastftp);
    this.lastftp = time;

    util.log("lastftp:" + time + " nowTp:" + this.nowTp);
};

/**
 *  每一帧操作
 * @param time
 * @returns {boolean}
 */
vcppt.playback = function (time) {
    do {
        if (this.pause) return false;

        this.handletime(time);

        var drawdate = this.vcdpr.getTimestampFromJson(this.nowTp);

        if (drawdate === false && this.vcdpr.isEnd() && this.nowTp < this.vcdpr.getDuration()) break;

        if (drawdate === false) return false;

        var s = this.vcdpr.getScreen();

        this.wr = this.view.W / s.w;
        this.hr = this.view.H / s.h;

        util.each(drawdate, function (k, v) { //动作处理

            if (v.action == 0) {
                this.videoCanvas.penDown(v.PointX * this.wr, v.PointY * this.hr);
                return;
            }

            if (v.action == 2) {
                this.videoCanvas.penMove(v.PointX * this.wr, v.PointY * this.hr);
                return;
            }

            if (v.action == 1) {
                this.videoCanvas.penUp(v.PointX * this.wr, v.PointY * this.hr);
                return;
            }

            if (v.action == 5) { //视图移动
                this.videoCanvas.viewMove(0, v.screenOffset / 100 * this.view.H, this.view);
                return;
            }

            if (v.action == 9) { //图像
                var img = this.vcdpr.getImg(v.imgName);
                if (!(img instanceof Image)) return;
                var x = 0, y = v.screenIndex * this.view.H;

                if (v.mode == 0 || (img.width >= this.view.W && img.height >= this.view.H)) { //铺满全屏
                    this.videoCanvas.drawImage(img, x, y, this.view.W, this.view.H);
                    return;
                }

                //模式:按图片大小进行加载,最大一页(视口大小)
                if (img.width >= this.view.W) { //宽超出页面宽度
                    var w = this.view.W, h = img.height * (this.view.W / img.width);//比例缩放处理
                    this.videoCanvas.drawImage(img, x, y, w, h);
                    return;
                }

                if (img.height >= this.view.H) { //高超出页面高度
                    var w = img.width * (this.view.H / img.height), h = this.view.H; //比例缩放处理
                    this.videoCanvas.drawImage(img, x, y, w, h);
                    return;
                }

                this.videoCanvas.drawImage(img, x, y);
            }
        }, this);
    } while (false);

    this.view.drawViewTo(this.playContext);
    this.notifyUI(this.UI.VIDEO_FRAME);
    return true;
};

/**
 * playing
 *
 * @param time
 */
vcppt.playing = function (time) {
    time = +new Date();
    var vcpHandle = this;
    if (vcpHandle.playback(time)) {
        window.requestNextAnimationFrame(function (t) {
            vcpHandle.playing(t)
        });
    } else {
        if (this.vcdpr.isEnd() && this.nowTp >= this.vcdpr.getDuration()) { //视频播放结束
            this.onPause();
            this.notifyUI(this.UI.VIDEO_END);
            return;
        }
    }
};

/**
 *  暂停
 */
vcppt.onPause = function () {
    this.pause = true;
    this.audio.pause();
    this.lastPauseTp = +new Date();
    this.notifyUI(this.UI.VIDEO_PAUSE);
};

/**
 *  播放
 */
vcppt.onPlay = function () {
    if (!this.isLoaded() || this.vcdpr.isEnd()) return; //数据未加载完成或加载失败,或者已经播放完毕
    this.pause = false;
    this.lastftp = this.lastPlayTp = +new Date();
    this.videoDuration = this.vcdpr.getDuration();
    this.audio.play();
    this.playing(this.nowTp);
    this.notifyUI(this.UI.VIDEO_PLAY);
};

/**
 * 重置时间点（以秒计）
 *   从某一时间点继续播放
 * @param tp 0-100 总的时长百分比
 */
vcppt.timePoint = function (tp) {
    if (!this.isLoaded()) return; //数据未加载完成或加载失败
    if (typeof tp == 'number' && (tp >= 0 && tp <= 100)) {
        this.nowTp = Math.floor(tp * this.vcdpr.getDuration() / 100000) * 1000;
        this.vcdpr.resetLastIndex(0);
        this.videoCanvas.clearCanvas();
        this.audio.setCurTime(Math.floor(this.nowTp / 1000))
        this.notifyUI(this.UI.VIDEO_RESET);
    }
    util.log("timePoint:" + tp);
};

/**
 * 初始音频
 *
 * @param s  音频地址
 * @param i 是否忽略
 */
vcppt.initAudio = function (s, i) {
    this.audio.setSrc(s);
    this.audio.ignore(i ? i : false);
    this.audio.setVolume(this.audioVolume / 100);
};

/**
 * 设置音量
 *
 * @param v 0-100
 */
vcppt.setVolume = function (v) {
    if (typeof v !== 'number') return;
    this.audio.setVolume(v / 100);
    this.notifyUI(this.UI.VIDEO_VOLUME);
};

vcppt.getVolume = function () {
    this.audio.getVolume() * 100;
};

/**
 *
 * @param action
 * @param context
 */
vcppt.notifyUI = function (action, context) {
    if (action == this.UI.VIDEO_LOAD_DATA_SUCCESS && !this.isLoaded())  return;
    if (typeof this.UI.notifyUI == 'function') {
        if (typeof context == 'undefined') context = this;
        if (action == this.UI.VIDEO_LOAD_DATA_SUCCESS)   this.videoDuration = this.vcdpr.getDuration();

        this.UI.notifyUI(action, context)
    }
};

/**
 * 主要数据是否已成功加载完
 */
vcppt.isLoaded = function () {
    return this.vcdpr.isReadied() && this.audio.isReadied();
};

/**
 *  加载数据
 */
vcppt.load = function () {
    this.vcdpr.getJsonData();
};


/**
 * vcdpr 数据源处理
 */
var vcdpr = function () {
    this.Url = '';
    this.JsonData = {screenSize: {w: 0, h: 0}, "traceData": [], "duration": 0};
    this.loadOk = false; //数据是否加载完成
    this.lastIndex = 0;
    /** @type vcp */
    this.vcpObj = null;

    /** 图片加载缓存 @type array */
    this.imgCache = {};
    this.imgLoadedCount = 0; //已经加载完的图片数量
    this.imgIsLoaded = false; //是否所有图片加载完

};

vcdpr.prototype = {

    /**
     * 获取数据并转为相应的json数据，
     * 保存在 vcdpr.JsonData 变量中
     */
    getJsonData: function () {
        var own = this;
        util.http.ajax({
            type: 'get',
            url: this.Url,
            dataType: "json",
            success: function (d) {
                if (typeof d != 'object')
                    d = JSON.parse(d);
                if (d.hasOwnProperty('responseNo') && d.hasOwnProperty('videoData') && d.responseNo == 0) {
                    own.JsonData = d.videoData;
                    own.preProcessor();
                    own.loadOk = true;
                    own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_SUCCESS);
                    return;
                }
                own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_FAILURE);
            },
            error: function (d) {
                util.log(d);
                own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_FAILURE);
            }
        });
    },

    /**
     * 数据预处理
     */
    preProcessor: function () {

        var traceData = this.JsonData.traceData;
        var len = this.JsonData.traceData.length;
        for (var ti = 0; ti < len; ti++) { //时间戳数据
            for (var dj = 0; dj < traceData[ti].data.length; dj++) {  //遍历每一条action数据
                var action = traceData[ti].data[dj];
                if (action.length <= 0) continue;
                if (action.action in [0, 1, 2]) { //笔迹
                    if (typeof action.screenOffset == 'undefined' || action.screenOffset == 0)  continue;
                    action.PointY = action.PointY + (action.screenOffset / 100) * this.JsonData.screenSize.h;
                    continue;
                }
                if (action.action == 5) { //视图移动
                    continue;
                }
                if (action.action == 9) { //图片
                    this.imgCache[action.imgName] = '';
                    continue;
                }
            }
        }

        //图片处理
        this.imgsLoad();

        //音频处理
        if (this.JsonData.audioUrl && (/(.mp3)|(.wav)|(.ogg)$/i).test(this.JsonData.audioUrl)) {
            this.vcpObj.initAudio(this.JsonData.audioUrl);
        } else {
            this.vcpObj.initAudio('', true);//忽略音频处理
        }


    },

    /**
     * 图片预加载
     */
    imgsLoad: function () {
        var own = this;
        if (util.empty(this.imgCache)) {
            own.imgIsLoaded = true;
            own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_SUCCESS);
            return;
        }
        var http = this.JsonData.imgPath;

        for (var imgName in this.imgCache) {
            var imgID = new Image();
            imgID.src = http + imgName;
            imgID.onload = function () {
                own.imgLoadedCount++;
                imgID.loaded = true;
                if (own.imgLoadedCount == util.len(own.imgCache)) { //全部加载完毕
                    own.imgIsLoaded = true;
                    own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_SUCCESS);
                }
            };
            imgID.onerror = function () {
                util.log('load picture fail');
                own.toUI(own.vcpObj.UI.VIDEO_LOAD_DATA_FAILURE);
            };
            this.imgCache[imgName] = imgID;
        }
    },

    toUI: function (type) {
        //只有数据加载和图片加载完毕，才允许发送数据加载完毕信号
        if (type == this.vcpObj.UI.VIDEO_LOAD_DATA_SUCCESS && (!this.loadOk || !this.imgIsLoaded)) return;
        this.vcpObj.notifyUI(type);
    },

    /**
     *
     * @param timestamp
     * @param flat
     */
    getTimestampFromJson: function (timestamp, flat) {
        var data = [];
        if (!this.loadOk || this.lastIndex >= this.JsonData.traceData.length || timestamp > this.JsonData.duration) return false;
        if (flat) {
            return;
        }
        for (; this.lastIndex < this.JsonData.traceData.length
               && this.JsonData.traceData[this.lastIndex].timestamp <= timestamp; this.lastIndex++) {
            for (var i = 0; i <= this.JsonData.traceData[this.lastIndex].data.length; i++) {
                if (this.JsonData.traceData[this.lastIndex].data[i])
                    data.push(this.JsonData.traceData[this.lastIndex].data[i]);
            }

        }

        return data;
    },

    getDuration: function () {
        return this.JsonData.duration;
    },

    getScreen: function () {
        return this.JsonData.screenSize
    },

    hasImg: function () {
        return this.imgCache.hasOwnProperty(imgName);
    },

    getImg: function (imgName) {
        return this.imgCache.hasOwnProperty(imgName) ? this.imgCache[imgName] : '';
    },
    resetLastIndex: function (i) {
        this.lastIndex = 0;
        if (typeof i == 'number' && i >= 0 && i <= this.JsonData.traceData.length) {
            this.lastIndex = i;
        }
    },

    /**
     * 是否已经播放了最后一条数据
     */
    isEnd: function () {
        return this.lastIndex >= this.JsonData.traceData.length;
    },
    /**
     * 数据是否准备完毕
     */
    isReadied: function () {
        return this.loadOk && this.imgIsLoaded;
    }

};

///**
// * 二维坐标点
// * @param x
// * @param y
// */
//var point = function (x, y) {
//    this.X = x;
//    this.Y = y;
//};

/**
 * 视口对象
 * @param x
 * @param y
 * @param w 宽
 * @param h 高
 */
var viewObj = function (x, y, w, h, ctx) {
    //view原点(X,Y)
    this.X = x;
    this.Y = y;

    this.W = w;
    this.H = h;

    this.CTX = ctx;

    /**
     @param {Number} x
     @param {Number} y
     */
    this.moveTo = function (x, y) {
        this.X = x;
        this.Y = y;
    };

    this.getViewImage = function () {
        return this.CTX.getImageData(this.X, this.Y, this.W, this.H);
    };

    this.drawViewTo = function (ctx) {
        if (ctx instanceof CanvasRenderingContext2D) {
            ctx.save();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // ctx.putImageData(this.getViewImage(), 0, 0);
            ctx.drawImage(this.CTX.canvas,
                this.X, this.Y, this.W, this.H,
                0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
};


/**
 *
 * 离屏 canvas
 *
 * @param {object} O
 */
var vc = function (o) {
    if (typeof o === 'object')
        vc.options = util.mergeOptions(vc.options, o);

    this.canvas = document.createElement('canvas');
    this.canvas.width = vc.options.cw;
    this.canvas.height = vc.options.ch;

    this.context = this.canvas.getContext('2d');
    this.context.strokeStyle = vc.options.strokeStyle;
    this.context.lineWidth = vc.options.lineWidth;
    this.drawingSurfaceImageData = null;
};

var vcpt = vc.prototype;
/**
 *
 * @type {{vw: number, vh: number, cw: number, ch: number, strokeStyle: *, lineWidth: number}}
 */
vc.options = {

    "vw": 150, //视口宽
    "vh": 100, //视口高
    "cw": 150, // canvas宽
    "ch": 800, // canvas高

    // "strokeStyle": 'rgba(0,255,255,1)', //线风格 如：颜色
    //"font": '',
    // "fillStyle": '',
    "lineColor": 'red',
    "lineWidth": 1  //线粗细
};

vcpt.saveDrawingSurface = function () {
    this.drawingSurfaceImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
};


vcpt.restoreDrawingSurface = function () {
    if (null != this.drawingSurfaceImageData)
        this.context.putImageData(this.drawingSurfaceImageData, 0, 0);
};

vcpt.getView = function (x, y, w, h) {
    return new viewObj(
        x ? x : 0,
        y ? y : 0,
        w ? w : vc.options.vw,
        h ? h : vc.options.vh,
        this.context
    )
};

vcpt.penDown = function (x, y) {
    this.context.beginPath();
    this.context.moveTo(x, y);
};

vcpt.penUp = function (x, y) {
    this.context.lineTo(x, y);
    this.context.stroke();
};

vcpt.penMove = function (x, y) {
    this.context.lineTo(x, y);
    this.context.stroke();
};

vcpt.viewMove = function (x, y, v) {
    if (v instanceof viewObj)
        v.moveTo(x, y);
};

vcpt.clearCanvas = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

vcpt.drawImage = function (img, x, y, w, h) {
    if (img instanceof Image)
        this.context.drawImage(img, x, y, w, h);
};

vcpt.notice = function (vc) {
};


/**
 * 音频处理
 * @param h handler
 */
var pAudio = function (h) {

    this.audio = document.createElement("audio");

    this.vcpObj = h;

    this.ignored = false; //是否忽视音频处理

    own = this;

    this.audio.addEventListener("canplaythrough", function () {
            if (!own.flat)
                own.vcpObj.notifyUI(own.vcpObj.UI.VIDEO_LOAD_DATA_SUCCESS);
            own.flat = true; //发送过加载完毕信息
        }
    );
    this.audio.addEventListener("error", function () {
            util.log('load audio fail');
            own.vcpObj.notifyUI(own.vcpObj.UI.VIDEO_LOAD_DATA_FAILURE);
        }
    );
};

pAudio.prototype = {
    /**
     * 播放
     * @param s 新的播放起点（单位：秒） 。如果未定义，则是继续上一次的播放点
     */
    play: function (s) {
        if (this.ignored || !this.isReadied())
            return;
        if (s)
            this.setCurTime(s);
        this.audio.paused && this.audio.play && this.audio.play();
    },
    pause: function () {
        !this.ignored && this.isReadied() && this.audio.pause && this.audio.pause();
    },
    ignore: function (b) {
        if (typeof b == 'boolean')
            this.ignored = b;
        else
            this.ignored = true;
    },
    setVolume: function (v) {
        if (v > 0.0 && v < 1.0) {
            this.audio.volume = v;
        }
    },
    getVolume: function () {
        return this.audio.volume;
    },
    setSrc: function (s) {
        if (typeof s !== 'string' && !(/(.mp3)|(.wav)|(.ogg)$/i).test(s)) {
            util.log('This audio format is not supported ');
            return;
        }
        this.audio.src = s;

    },
    isReadied: function () {
        return this.ignored || this.audio.readyState == 4;
    },
    /**
     * 设置音频中的当前播放位置（以秒计）。
     * @param s
     */
    setCurTime: function (s) {
        if (!this.ignored && typeof s === 'number' && this.audio.currentTime) {
            this.audio.currentTime = s;
        }
    }

};

/**
 * 帧速率约为 60fps
 */
window.requestNextAnimationFrame =
    (function () {
        var originalWebkitRequestAnimationFrame = undefined,
            wrapper = undefined,
            callback = undefined,
            geckoVersion = 0,
            userAgent = navigator.userAgent,
            index = 0,
            self = this;

        // Workaround for Chrome 10 bug where Chrome
        // does not pass the time to the animation function

        if (window.webkitRequestAnimationFrame) {
            // Define the wrapper

            wrapper = function (time) {
                if (time === undefined) {
                    time = +new Date();
                }
                self.callback(time);
            };

            // Make the switch

            originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;

            window.webkitRequestAnimationFrame = function (callback, element) {
                self.callback = callback;

                // Browser calls the wrapper and wrapper calls the callback

                originalWebkitRequestAnimationFrame(wrapper, element);
            }
        }

        // Workaround for Gecko 2.0, which has a bug in
        // mozRequestAnimationFrame() that restricts animations
        // to 30-40 fps.

        if (window.mozRequestAnimationFrame) {
            // Check the Gecko version. Gecko is used by browsers
            // other than Firefox. Gecko 2.0 corresponds to
            // Firefox 4.0.

            index = userAgent.indexOf('rv:');

            if (userAgent.indexOf('Gecko') != -1) {
                geckoVersion = userAgent.substr(index + 3, 3);

                if (geckoVersion === '2.0') {
                    // Forces the return statement to fall through
                    // to the setTimeout() function.

                    window.mozRequestAnimationFrame = undefined;
                }
            }
        }

        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||

            function (callback, element) {
                var start,
                    finish;

                window.setTimeout(function () {
                    start = +new Date();
                    callback(start);
                    finish = +new Date();

                    self.timeout = 1000 / 60 - (finish - start);

                }, self.timeout);
            };
    })
    ();






