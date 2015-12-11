# playerJs
canvas player

>> 用canvas实现视频播放效果。当然，只能算是伪视频播放器，因为，它只是针对特定的数据格式。给每一个画图动作都赋予时间戳，一连贯的基于时间的画图动作呈现出来，就有了视频播放的效果。

##<a name="index"/>目录
* [项目目录](#project_dir)
* [视频数据格式说明](#video_format)
* [使用](#video_use)
* [**](#**)


##<a name="project_dir"/>项目目录

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
      player-*.min.js   --> 源码压缩代码。所有js压缩，所以，使用时引用此文件即可
      video.html        --> 播放器html


##<a name="video_format"/>视频数据格式说明

[demo.json](https://github.com/BPing/playerJs/blob/dev/demo.json):
<<<<<<< HEAD

```json

=======
```json
>>>>>>> origin/dev
{
  "responseNo": 0,  //返回码
  
  "videoData": {  //视频数据
  
    "imgPath": "./res/",  //图片根目录
    
    "audioUrl": "./res/Audio.mp3",  //音频地址
    "screenSize": {  //屏幕尺寸
      "w": 150,
      "h": 100
    },

    "traceData": [  //帧数据
      {
        "timestamp": 500,  //时间戳
        "data": [         //具体画图动作
          {
            "userType": 1,
            "screenOffset": 0, // 屏幕偏移。以页面值为100，也是一个视口的高度。 具体偏移量= (screenOffset/100)*view.heigth
            "action": 9,   //画图片动作
            "imgName": "01201512021516100015.jpg", //图片名字。图片地址=imgPath+imgName
            "pointX": 0,  //画图起点X
            "pointY": 0,  //画图起点Y
            "mode": 1,    //0：铺满一页，1：按图片大小缩放。Notice：无论哪种模式，图片至多显示在一个页面上
            "screenIndex": 0 //页面偏移量，相对整个页面。假如screenIndex=1，则表示此图画在第二个页面，以此类推。
            //**Notice**：一个视口的大小就是一个页面大小。
          }
        ]
      },
      {
      "timestamp": 1000, //时间戳
        "data": [   //具体动作数据
          {
            "userType": 1,
            "screenOffset": 0,
            "action": 0,  //动作 0：按下画笔，2：画笔移动画线，1：移开画笔，停止画线
            "pointX": 75,
            "pointY": 60,
          },
          ]
      }
       {
        "timestamp": 5500,
        "data": [
          {
            "userType": 1,
            "screenOffset": 0, //视口移动偏移量
            "action": 5  //视口移动
          }
        ]
      }
     ],
     "duration": 6000  //视频总时间长 单位：毫秒
    //**Notice**："timestamp" 相对视频始点的偏移时间戳，单位：毫秒
   }
}
```

##<a name="video_user"/>使用

```javascript
  
```
