# playerJs
canvas player

>> 用canvas实现视频播放效果。当然，只能算是伪视频播放器，因为，它只是针对特定的数据格式。给每一个画图动作都赋予时间戳，一连贯的基于时间的画图动作呈现出来，就有了视频播放的效果。

##<a name="index"/>目录
* [项目目录](#project_dir)
* [视频数据格式解说](#video_format)
* [**](#**)


##<a name="index"/>项目目录

    playerJs/            --> 
      css/              --> css 文件
        index.css         --> default stylesheet
      res/              --> 资源文件，包括图片
        close.png        --> 
        loading.gif      --> 
      src/              --> 
        coreJs.js        --> 核心代码。数据解析， 视频播放，音频播放等处理
        playJs.js        --> ui控制代码。根据相应的动作更新页面和监控页面事件
        utilJs.js        --> 通用工具类。
      demo.json         --> 视频数据示例
      example.tml       --> 例子
      player-*.min.js   --> 源码压缩代码。所有js压缩，所以，使用时引用本文件即可
      video.html        --> 播放器html

