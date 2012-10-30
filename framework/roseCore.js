/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-15
 * Time: 上午11:08
 *
 */

/**
 * 将核心类和函数挂载到全局对象上
 */
var Texture = roseCore.Texture;//纹理类
var FillRect = roseCore.FillRect;//填充区域
var TextField = roseCore.TextField;//文本域类
var MovieClip = roseCore.MovieClip;//影片剪辑类
var Event = roseCore.Event;//事件类
var Sound = roseCore.Sound;//声音类
var Tween = roseCore.Tween;//缓动类
var LoadProcessor = roseCore.LoadProcessor;//加载进度处理器
var BitArray = roseCore.BitArray;//位数组
var textureLoader = roseCore.textureLoader;//纹理载入工具
var configLoader = roseCore.configLoader;//配置文件载入工具
var gameStage = roseCore.gameStage;//游戏舞台实例
var trace = roseCore.trace;//log工具
var ajax = roseCore.ajax;//ajax工具
var defineClass = roseCore.defineClass; //定义类(暂时不使用)

//如果在浏览器中，用window.onload触发documentReady
if (global.isInBrowser) {
    /**
     * 为浏览器里提供setMainLoop函数
     * @param func
     * @param interval
     */
    window.setMainLoop = (function() {
        var timer;
        return function(func, interval) {
            clearInterval(timer);
            timer = setInterval(func, interval);
        };
    })();
    window.onload = documentReady;
}

//如果在壳里，自动调用documentReady
function documentReady() {

    //如果在浏览器中，手动创建canvas对象并添加到body中，壳里会自动创建全局的canvas。
    if (global.isInBrowser) {
        var nodeCanvas = document.createElement('canvas');
        nodeCanvas.setAttribute('width', global.GAME_WIDTH);
        nodeCanvas.setAttribute('height', global.GAME_HEIGHT);
        nodeCanvas.style.cssText = 'border:1px solid black';
        //挂载canvas到自定义全局对象
        canvas = global.canvas = nodeCanvas;
        var center = document.createElement('center');
        center.appendChild(canvas);
        document.getElementsByTagName('body')[0].appendChild(center);
        canvas['style']['backgroundColor'] = global.backgroundColor;

    } else {
        //挂载canvas到自定义全局对象
        global.canvas = canvas;
        global.GAME_WIDTH = canvas.width;
        global.GAME_HEIGHT = canvas.height;
    }
    //挂载canvas上下文到自定义全局对象
    global.context2d = canvas.getContext('2d');

    /**
     * 调用主函数
     */
    main();
}
