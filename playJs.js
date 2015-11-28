(function ($) {

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

    var myUI = new VideoCanvasPlayerUI();
    var myPlayer = new VideoCanvasPlayer({cw: 1080, ch: 648 * 8, vw: 1080, vh: 648, UI: myUI});

    myUI.notifyUI = function (act, ctx) {
        if (act == myUI.VIDEO_FRAME) {
            timeShow.update(ctx.nowTp, ctx.videoDuration);
            progress.setWidth(ctx.videoDuration <= 0 ? 0 : (ctx.nowTp / ctx.videoDuration) * 100);

            util.log("VIDEO_FRAME lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }
        if (act == myUI.VIDEO_END) {
            timeShow.update(ctx.videoDuration, ctx.videoDuration);
            progress.setWidth(100);
            playPause.pauseDraw();
            playPause.showOverMsg();

            util.log("VIDEO_END lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }
        if (act == myUI.VIDEO_RESET) {
            var s = timeShow.isLocked();
            timeShow.unLock();
            timeShow.update(ctx.nowTp, ctx.videoDuration);
            if (s)
                timeShow.lock();

            util.log("VIDEO_RESET  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }
        if (act == myUI.VIDEO_PLAY) {

            util.log("VIDEO_PLAY  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }

        if (act == myUI.VIDEO_PAUSE) {

            util.log("VIDEO_PAUSE  lastftp:" + ctx.lastftp + " nowTp:" + ctx.nowTp);
        }
    };

    var event = {

        init: function () {

            //播放按钮点击事件
            $("." + playPauseName).bind("click", function (e) {
                e.preventDefault();
                if ($("#" + playBtnName).css("display") == "none") {
                    playPause.pauseDraw();                //pause
                    myplayer.onPause();
                }
                else if ($("#" + pauseBtnName).css("display") == "none") {
                    playPause.playDraw();                //play
                    myplayer.onPlay();
                }
                return true;
            });

            //进度条处理事件
            $("#" + progressBtnName).bind("mousedown", function (e) {
                e.preventDefault();
                btnMouseDown = 1;
                progress.lock();
                timeShow.lock();

                playPause.pauseDraw();                //pause
                myplayer.onPause();

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

                myplayer.timePoint(progresswidth);
                return false;
            });
            $("#" + progressBtnName).bind("mouseout", function (e) {
                btnMouseDown = 0;
                progress.unLock();
                timeShow.unLock();
                return false;
            });
            $("#" + progressBtnName).bind("mouseup", function (e) {
                btnMouseDown = 0;
                progress.unLock();
                timeShow.unLock();
                return false;
            });
        }

    };

    event.init();

    /**
     * 进度条
     *
     * @type {{}}
     */
    var progress = {
        //进度条位置设置
        setWidth: function (width) {
            if (!checkProcessLocked()) {
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
    var timeShow = {

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
    var playPause = {
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
            $("#" + infoName + " p").css({opacity: 1});
            $("#" + infoName + " p").html("暂停");
        },

        //隐藏暂停消息
        hidePauseMsg: function () {
            $("#" + infoName + " p").css({opacity: 0});
        },

        //显示完毕消息
        showOverMsg: function () {
            $("#" + infoName + " p").css({opacity: 1});
            $("#" + infoName + " p").html("完毕");
        },

        //隐藏完毕消息
        hideOverMsg: function () {
            $("#" + infoName + " p").css({opacity: 0});
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

})
($);
