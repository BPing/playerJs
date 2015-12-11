/**
 *options = {
*    "vw": 600, //视口宽
*    "vh": 400, //视口高
*    "cw": 600, // canvas宽
*    "ch": 3200, // canvas高
*     "url":''
*    'volume': 50,
*  };
 */
var videoUI = function () {
};

/**
 * 启动
 */
videoUI.startup = function (o) {
    o.resUrl = o.resUrl ? o.resUrl : '';
    var closePngPath = o.resUrl + 'res/close.png';

    if (!$("#videoWin").is("div")) {
        var videoUrl = o.resUrl + 'video.html?' + util.objToStr(o);
        $('body').append("<div id='videoShade'><a href='javascript:void(0);' id='videoClose'><img id='closePng'src='" + closePngPath + "'  width='40px' height='40px' />Close</a></div>");
        $('body').append("<div id='videoWin'><iframe width='100%' height='100%' scrolling='no' frameborder=0  src='" + videoUrl + "' ></iframe></div>");
        //设置遮罩样式
        $("#videoShade").css({
            position: "absolute",
            "background-color": "black",
            opacity: '0.6',
            width: $(window).width(),
            height: $(window).height(),
            "z-index": 10,
            top: 0
        });
        //设置close样式
        $("#videoClose").css({position: "absolute", "right": "20px", "top": "10px", "color": "white", "z-index": 15});

        //设置close hover样式
        var closeCss = document.getElementById('videoClose');
        var closePng = document.getElementById('closePng');
        closeCss.onmouseover = function () {
            closeCss.style.color = "yellow";
            closePng.style['z-index'] = "100";
            closePng.style.width = "45px";
            closePng.style.height = "45px";
        };
        closeCss.onmouseout = function () {
            closeCss.style.color = "white";
            closePng.style['z-index'] = "15";
            closePng.style.width = "40px";
            closePng.style.height = "40px";
        };

        //设置videoWin 样式
        var width = $(window).width() * 0.8;
        var height = (width * 768) / 1280;
        var left = ($(window).width() - width) / 2;
        var top = ($(window).height() - height) / 2;
        $("#videoWin").css({
            left: left,
            top: top,
            width: width,
            height: height,
            "z-index": 11,
            position: "absolute"
        });
        //
        $("#videoClose").click(function () {
            $("#videoWin").remove();
            $("#videoShade").remove();
        });
    }
};

videoUI.options = {
    "resUrl": '',
};

videoUI.handler = function (options) {

    options = util.mergeOptions(VideoCanvasPlayer.options, util.mergeOptions(videoUI.options, options));
    if (options.url == '')
        options.url = './demo.json';

    var drawContainerName = "drawContainer";
    var canvasContainerName = "canvasDiv";
    var progressName = "progress";
    var progressBtnName = "progressBtn";
    var playerName = "player";
    var playPauseName = "play-pause";
    var playBtnName = "play";
    var pauseBtnName = "pause";
    var infoName = "info";
    var mainContainerName = "mainContainer";
    var progressLock = 0;
    var playerShowLock = 0;
    var timeShowLock = 0;
    var btnMouseDown = 0;
    var timePlayedName = "time_played";
    var timeDurationName = "time_duration";
    var parseLoadingName = "parseLoading";
    var volumeControlName = "volume-scrubber";
    var volumeProgressName = "volume-progress";

    var loadPath = 'res/loading.gif';
    var message = {
        load_success: 'Loading Success',
        load_fail: 'Loading Failure',
        play: 'Play',
        pause: 'Pause',
        end: 'The End'
    };

    $("<canvas id='canvas' style='z-index:3000;'></canvas>").prependTo("#" + canvasContainerName);
    $('#' + mainContainerName).css({width: options.vw, height: options.vh + 64});
    $('#' + drawContainerName).css({width: options.vw, height: options.vh});
    $('#' + playerName).css({width: options.vw + 2, top: options.vh});

    var myUI = new VideoCanvasPlayerUI();
    options.UI = myUI;
    var myPlayer = new VideoCanvasPlayer(options);

    myUI.notifyUI = function (act, ctx) {

        if (act == myUI.VIDEO_FRAME) {
            timeShowUI.update(ctx.nowTp, ctx.videoDuration);
            progressUI.setWidth(ctx.videoDuration <= 0 ? 0 : (ctx.nowTp / ctx.videoDuration) * 100, true);

            util.log("VIDEO_FRAME lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_END) {
            timeShowUI.update(ctx.videoDuration, ctx.videoDuration);
            progressUI.setWidth(100, true);
            playPauseUI.pauseDraw();
            playPauseUI.showOverMsg();

            util.log("VIDEO_END lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_RESET) {
            timeShowUI.update(ctx.nowTp, ctx.videoDuration);
            util.log("VIDEO_RESET  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_END_RESET) {
            timeShowUI.update(ctx.nowTp, ctx.videoDuration);
            progressUI.setWidth(ctx.videoDuration <= 0 ? 0 : Math.floor(ctx.nowTp / 1000) / (ctx.videoDuration / 100000), true);
            util.log("VIDEO_RESET  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }
        if (act == myUI.VIDEO_PLAY) {
            util.log("VIDEO_PLAY  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_PAUSE) {
            util.log("VIDEO_PAUSE  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_LOAD_DATA_SUCCESS) {
            playPauseUI.hideDrawLoading();
            audioUI.setVolume(ctx.getVolume());
            msgShow.show(message.load_success);
            timeShowUI.update(ctx.nowTp, ctx.videoDuration);
        }

        if (act == myUI.VIDEO_LOAD_DATA_FAILURE) {
            playPauseUI.hideDrawLoading();
            msgShow.show(message.load_fail);
            progressUI.lock();
            timeShowUI.lock();
        }
    };

    /**
     * 事件处理
     *
     * @type {{init: event.init}}
     */
    var eventUI = {
        init: function () {
            //播放按钮点击事件
            $("." + playPauseName).bind("click", function (e) {
                e.preventDefault();
                if (!myPlayer.isLoaded())  return true;

                if ($("#" + playBtnName).css("display") == "none") {
                    playPauseUI.pauseDraw();                //pause
                    myPlayer.onPause();
                }
                else if ($("#" + pauseBtnName).css("display") == "none") {
                    playPauseUI.playDraw();                //play
                    myPlayer.onPlay();
                }

                return true;
            });

            //进度条处理事件
            $("#" + progressBtnName).bind("mousedown", function (e) {
                e.preventDefault();
                if (progressUI.isLocked()) return false;
                btnMouseDown = 1;
                progressUI.lock();
                playPauseUI.pauseDraw();  //pause
                myPlayer.onPause();
                return false;
            });
            $("#" + progressBtnName).bind("mousemove", function (e) {
                e.preventDefault();
                if (btnMouseDown != 1) return false;
                var pageX = e.pageX;
                var progressOffsetX = $('#' + progressName).offset().left;
                var progressBtnOffsetX = $('#' + progressBtnName).parent().offset().left;
                var progressTotalW = $('#' + progressName).parent().width();
                var progressBtnTotalW = $('#' + progressBtnName).parent().width();

                var progresswidth = eval(((pageX - progressOffsetX) / progressTotalW) * 100);
                progresswidth = util.boundary(parseFloat(progresswidth), 0, 100);

                processBtnLeftNum = (pageX - progressBtnOffsetX) / progressBtnTotalW;
                var progressBtnwidth = eval(processBtnLeftNum * 100);
                progressBtnwidth = util.boundary(parseFloat(progressBtnwidth), 0, 100);

                $("#" + progressName).css({width: progresswidth + "%"});
                $("#" + progressBtnName).css({left: progressBtnwidth + "%"});

                myPlayer.timePoint(progresswidth);
                return false;
            });
            $("#" + progressBtnName).bind("mouseout", function (e) {
                if (btnMouseDown == 1) {
                    btnMouseDown = 0;
                    progressUI.unLock();
                    myPlayer.notifyUI(myUI.VIDEO_END_RESET);
                }
                return false;
            });
            $("#" + progressBtnName).bind("mouseup", function (e) {
                if (btnMouseDown == 1) {
                    btnMouseDown = 0;
                    progressUI.unLock();
                    myPlayer.notifyUI(myUI.VIDEO_END_RESET);
                }
                return false;
            });

            $("#" + volumeControlName).bind("click", function (e) {
                e.preventDefault();
                //计算音量值,并设置
                var volumeDistance = e.pageX - $("#" + volumeControlName).offset().left;
                var volume = volumeDistance / $("#" + volumeControlName).width();

                var progressWdith = eval(volume * 100);
                if (parseFloat(progressWdith) > 100) {
                    progressWdith = "100";
                }
                //改变音量proress的显示
                audioUI.setVolume(progressWdith);
                myPlayer.setVolume(progressWdith);
                return false;
            });

            playPauseUI.showParseLoading();
            myPlayer.load();
        }
    };

    /**
     * 进度条
     *
     * @type {{}}
     */
    var progressUI = {

        /**
         * 进度条位置设置
         *
         * @param width
         * @param flag 强制更新
         */
        setWidth: function (width, flag) {
            if (!progressUI.isLocked() || flag) {
                $("#" + progressName).css({width: width + '%'});
                $("#" + progressBtnName).css({left: width + '%'});
            }
        },

        //检查进度条是否锁定
        isLocked: function () {
            return progressLock;
        },

        //设置进度条锁定
        lock: function () {
            progressLock = 1;
        },

        //解锁进度条
        unLock: function () {
            progressLock = 0;
        }

    };

    /**
     *  时间显示处理
     *
     * @type {{}}
     */
    var timeShowUI = {

        isLocked: function () {
            return timeShowLock;
        },
        //设置显示时间锁定
        lock: function () {
            timeShowLock = 1;
        },

        //解锁显示时间
        unLock: function () {
            timeShowLock = 0;
        },

        update: function (current, total) {
            $("#" + timePlayedName).html(util.timeFormat(current));
            $("#" + timeDurationName).html(util.timeFormat(total));
        }
    };

    /**
     * 播放暂停处理
     */
    var playPauseUI = {

        //显示loading
        showParseLoading: function () {
            var left = $("#" + drawContainerName).attr("width") / 2;
            var top = $("#" + drawContainerName).attr("height") / 2;
            $("<img id='" + parseLoadingName + "' src=" + loadPath + " style='position:absolute;z-index:110;left:" + left + "px;top:" + top + "px' />").insertAfter("#" + drawContainerName);
        },

        //隐藏loading
        hideDrawLoading: function () {
            $("#" + parseLoadingName).remove();
        },
        //显示为播放
        showPlayBtn: function () {
            $("#" + pauseBtnName).hide();
            $("#" + playBtnName).show();
        },

        //显示为暂停
        showPauseBtn: function () {
            //不显示暂停动画
            this.hidePauseMsg();
            $("#" + playBtnName).hide();
            $("#" + pauseBtnName).show();
        },

        //显示暂停消息
        showPauseMsg: function () {
            msgShow.show(message.pause);
        },

        //隐藏暂停消息
        hidePauseMsg: function () {
            msgShow.hide();
        },

        //显示完毕消息
        showOverMsg: function () {
            msgShow.show(message.end)
        },

        //隐藏完毕消息
        hideOverMsg: function () {
            msgShow.hide();
        },

        //设置播放器控制锁定显示
        setPlayerShowLock: function () {
            playerShowLock = 1;
        },

        //设置播放器控制解锁显示
        setPlayerShowUnLock: function () {
            playerShowLock = 0;
        },

        //检查播放器控制是否被锁定显示
        checkPlayerShowLock: function () {
            return playerShowLock;
        },
        //暂停
        pauseDraw: function () {
            //显示暂停动画
            this.showPauseMsg();
            //播放按钮样式设置
            this.showPlayBtn();
        },

        //播放
        playDraw: function () {
            //不显示暂停动画
            this.hidePauseMsg();
            //播放按钮样式设置
            this.showPauseBtn();
            //发送 播放 事件
        }
    };

    /**
     * 音频
     * @type {{}}
     */
    var audioUI = {

        setVolume: function (w) {
            $("#" + volumeProgressName).css({width: w + "%"});
        }

    };

    /**
     *  信息显示
     * @type {{show: msgShow.show, hide: msgShow.hide}}
     */
    var msgShow = {
        show: function (msg) {
            $("#" + infoName + " p").css({opacity: 1});
            $("#" + infoName + " p").html(msg);
        },
        hide: function () {
            $("#" + infoName + " p").css({opacity: 0});
        }
    };

    eventUI.init();
}
