# playerJs
canvas player

>> 用canvas实现视频播放效果。当然，只能算是伪视频播放器，因为，它只是针对特定的数据格式。给每一个画图动作都赋予时间戳，一连贯的基于时间的画图动作呈现出来，就有了视频播放的效果。

![code Coverage](https://github.com/BPing/playerJs/blob/dev/res/%E6%95%88%E6%9E%9C%E5%9B%BE.png?raw=true)

##<a name="index"/>目录
* [项目目录](#project_dir)
* [兼容性](#project_compatibility)
* [使用](#video_use)
* [视频数据格式说明](#video_format)
* [**](#**)


##<a name="project_dir"/>项目目录

    playerJs/            --> 
      css/              --> css 文件 (*必须)
        index.css         --> default stylesheet
      res/              --> 资源文件，包括图片 (*必须)
        close.png        --> 
        loading.gif      --> 
      src/              --> 
        coreJs.js        --> 核心代码。数据解析， 视频播放，音频播放等处理
        playJs.js        --> ui控制代码。根据相应的动作更新页面和监控页面事件
        utilJs.js        --> 通用工具类。
      demo.json         --> 视频数据示例
      example.html       --> 例子
      player-*.min.js   --> 源码压缩代码。所有js压缩，所以，使用时引用此文件即可 (*必须)
      video.html        --> 播放器html  (*必须)


##<a name="project_compatibility"/>兼容性

> * 浏览器：IE9+  Edge12+  Chorme43+  firebox41+  Safari8+  Opera33+ <br>
> * audio : mp3|wav  mp3 兼容性最好.<br>
> * IE 不支持wav格式，但Edge支持。


##<a name="video_use"/>使用

```javascript
   
   //html <script type="text/javascript" src="XXX/player-0.9.min.js"></script>

    videoUI.startup({
                  root: '../',  //此插件根目录
                  url: '',  //视频数据来源
                  volume: 50, //默认音量大小。0-100
                  "vw": 600, //视口宽
                  "vh": 400, //视口高
                  "cw": 600, // 底层canvas宽
                  "ch": 3200, // 底层canvas高
              });
  
```

##<a name="video_format"/>视频数据格式说明

![code Coverage](https://github.com/BPing/playerJs/blob/dev/res/size.png?raw=true)

>>    视频trace的格式定义:
>>
>>    第一行: 屏幕尺寸|trace版本
>>    
>>    最后一行: 整个视频的时长.[毫秒]
>>    
>>    回放 Trace 条目的定义...
>>    
>>   timestamp&(userType|screenOffset|action|color|pointX|pointY|time|pressure)
>>    
>>    &(userType|screenOffset|action|color|pointX|pointY|time|pressure)
>>
>>单个条目详细解释如下:
>>    
>>    `timestamp` 当前操作的偏移时间[与连接开始的时间偏移], 由服务器设置
>>    
>>    userType 当前数据来源
>>    
>>    `action` Down(0)|Move(2)|Up(1)|Cancel(3)|SCREEN_JUMP(5)|Image(9) 其中括号内的是具体的值.
>>
>>    color(AARRGGBB) int 值,当前点的颜色
>>    
>>    `pointX` 当前点的X值
>>    
>>    `pointY` 当前点的Y值
>>    
>>    time 当前事件发生的时间
>>    
>>    pressure 当前事件的压力.
>>
>>    `screenOffset` 屏幕的偏移百分比, 相对于屏幕高度.[单屏高度为100]
>>    
>>    Note:
>>    
>>    关于 action 复用的定义如下.
>>
>>    当值为 [0,3] 时, 是正常的划线操作.
>>
>>    当值为 [5] 时, 是表示对屏幕的移动操作. 后面的字段全部不存在.
>>
>>    此时trace的格式为 `timestamp`|userType|`screenOffset`|`action`
>>    
>>    当值为 [9] 时, 是表示加入图片. 后面的字段全部不存在, 如果不够则继续添加.
>>
>>    格式如下: 
>>    
>>    `图片名` * `pointX` * `pointY` * `模式mode` *  `屏幕索引screenIndex`|`图片名` * `pointX`  * `pointY` * `模式` * `屏幕索引`|`图片名` * `pointX` * `pointY` * `模式` * `屏幕索引`,
>>    
>>    图片的索引从1开始
>>    
>>    其中模式: [0: 铺满屏幕(最大一个页面)| 1: 按图片大小进行加载.(需根据屏幕比进行缩放)]

[demo.json](https://github.com/BPing/playerJs/blob/dev/demo.json):
```json
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

