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

        show: function (current, total) {
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
            //发送 暂停 事件
            myPlayer.onPause();

        },

        //播放
        playDraw: function () {
            //不显示暂停动画
            this.hidePauseMsg();
            //播放按钮样式设置
            this.showPauseBtn();
            //发送 播放 事件
            myPlayer.onPlay();
        },

        //播放按钮点击处理
        playPauseClick: function () {
            //pause
            if ($("#" + playBtnName).css("display") == "none") {
                pauseDraw();
            }
            //play
            else if ($("#" + pauseBtnName).css("display") == "none") {
                playDraw();
            }
        },

    };

})
($);
