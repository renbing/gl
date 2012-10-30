/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-17
 * Time: 下午10:04
 *
 */

(function () {
    var gameStage = {};
    var stage;
    var fps;
    var backgroundColor;
    var status;

    global.loopInterval = 0;
    global.nowTime = new Date();

    function init() {
        fps = global.renderFPS;
        backgroundColor = global.backgroundColor;
        status = gameStage.STATUS_PAUSED;
        stage = global.stage = new MovieClip('gameStage');
        canvas.addEventListener(Event.SHELL_MOUSE_DOWN, handleMouseDown, true);
        canvas.addEventListener(Event.SHELL_MOUSE_MOVE, handleMouseMove, true);
        canvas.addEventListener(Event.SHELL_MOUSE_UP, handleMouseUp, true);

        function handleMouseDown(e) {
            Event.moved = false;
            Event.enterObject = null;
            Event.enterEvent = null;
            Event.dragObject = null;
            Event.swipeObject = null;
            Event.moveEvent = null;
            Event.swipeSpeedCounter = 0;

            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            var event = new Event(Event.MOUSE_DOWN, point);
            Event.moveEvent = event;

            var hitedObject = stage.hitTest(point.x, point.y);
            if (hitedObject) {
                hitedObject.bubbleEvent(event);
                Event.enterObject = hitedObject;
                Event.enterEvent = event;
                Event.dragObject = hitedObject.bubbleFirstResponser(Event.GESTURE_DRAG);
                Event.swipeObject = hitedObject.bubbleFirstResponser(Event.GESTURE_SWIPE);
            }
        }

        function handleMouseMove(e) {
            Event.moved = true;
            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            var event = new Event(Event.MOUSE_MOVE, point);
            var hitedObject = stage.hitTest(point.x, point.y);

            // 如果有拖拽行为,直接只派发给拖拽对象
            if (Event.dragObject) {
                var offset = {x:point.x - Event.moveEvent.data.x, y:point.y - Event.moveEvent.data.y};
                Event.dragObject.triggerEvent(new Event(Event.GESTURE_DRAG, offset));
            } else {
                hitedObject && hitedObject.bubbleEvent(event);
            }

            if (Event.enterObject && Event.moveEvent) {
                var speed = (point.x - Event.moveEvent.data.x) / (+(new Date()) - Event.moveEvent.time);
                if (Math.abs(speed) >= Event.swipeAllowSpeed) {
                    Event.swipeSpeedCounter += 1;
                    if( speed < 0 ) {
                        Event.swipeDirection = Event.SWIPE_LEFT;
                    } else {
                        Event.swipeDirection = Event.SWIPE_RIGHT;
                    }
                } else {
                    Event.swipeSpeedCounter = 0;
                }
            }
            Event.moveEvent = event;
        }

        function handleMouseUp(e) {
            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            var event = new Event(Event.MOUSE_UP, point);

            var hitedObject = stage.hitTest(point.x, point.y);
            hitedObject && hitedObject.bubbleEvent(event);

            if (!Event.enterObject) {
                return;
            }
            var clickOffset = calculateDistance(point, Event.enterEvent.data);
            // 判断是否滑屏手势,移动过,且距离大于点击距离,且整个操作时间小于swipe设置的最小时间
            if (Event.swipeObject && Event.swipeSpeedCounter >= Event.swipeAllowSpeedCounter) {
                Event.swipeObject.triggerEvent(new Event(Event.GESTURE_SWIPE, Event.swipeDirection));
            }

            // 判断是否是点击行为, 没有移动过/移动但没有拖拽对象,且up/down在一定的距离范围内
            if ((!Event.moved || !Event.dragObject) && Event.enterObject) {
                if (clickOffset <= Event.clickAllowOffset) {
                    Event.enterObject.bubbleEvent(new Event(Event.MOUSE_CLICK, Event.enterEvent.data));
                }
            }

            if (Event.dragObject) {
                var offset = {x:point.x - Event.moveEvent.data.x, y:point.y - Event.moveEvent.data.y};
                Event.dragObject.triggerEvent(new Event(Event.GESTURE_DRAG, offset));
                Event.dragObject.triggerEvent(new Event(Event.GESTURE_DRAG_END, point));
            }

            Event.enterObject && Event.enterObject.bubbleEvent(event);
            Event.moved = false;
            Event.enterObject = null;
            Event.enterEvent = null;
            Event.dragObject = null;
            Event.swipeObject = null;
            Event.moveEvent = null;
            Event.swipeSpeedCounter = 0;
        }

        function calculateDistance(pointA, pointB) {
            return Math.sqrt(Math.pow(Math.abs(pointA.x - pointB.x), 2) +
                Math.pow(Math.abs(pointA.y - pointB.y), 2));
        }

        _run();
        return stage;
    }

    function _run() {
        if (status == gameStage.STATUS_PAUSED) {
            status = gameStage.STATUS_RUN;
            if (global.isInBrowser) {
                _renderInBrowser();
            } else {
                _renderInShell();
            }
        }
    }

    function _renderInShell() {
        setMainLoop(function () {
            var curTime = +new Date();
            global.loopInterval = curTime - global.nowTime;
            if (global.loopInterval > 1000)//防止iphone上面将游戏弹出之后再重进时动画瞬间跑完的情形
                global.loopInterval = 0;
            global.nowTime = curTime;
            global.gameSchedule.update();
            stage.render();
        }, 1000 / fps);
    }

    function _renderInBrowser() {
        var globalContext = global.context2d;
        setMainLoop(function () {
            var curTime = +new Date();
            global.loopInterval = curTime - global.nowTime;
            if (global.loopInterval > 1000)//防止iphone上面将游戏弹出之后再重进时动画瞬间跑完的情形
                global.loopInterval = 0;
            global.nowTime = curTime;
            global.gameSchedule.update();
            globalContext.clearRect(0, 0, canvas.width, canvas.height);
            stage.render();
        }, 1000 / fps);
    }

    gameStage.init = init;
    gameStage.STATUS_RUN = 0;
    gameStage.STATUS_PAUSED = 1;

    roseCore.gameStage = gameStage;
})();


