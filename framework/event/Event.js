/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-15
 * Time: 下午12:28
 *
 */

/**
 * 事件类
 *
 */
(function () {

    /**
     * 事件构造器
     * @param type: 事件类型
     * @param data: 外挂数据
     * @param isStoped: 是否停止
     */
    function Event(type, data, isStoped) {
        this.data = data;
        this.type = type;
        this.time = + new Date();   // 事件产生时间
        this.isStoped = isStoped || false;
    }

    /**
     * 停止事件传播
     */
    Event.prototype.stopPropagation = function() {
        this.isStoped = true;
    };

    // 底层原始事件
    Event.SHELL_MOUSE_DOWN = 'mousedown';
    Event.SHELL_MOUSE_MOVE = 'mousemove';
    Event.SHELL_MOUSE_UP = 'mouseup';
    
    // 原始事件
    Event.MOUSE_DOWN = 0;
    Event.MOUSE_MOVE = 1;
    Event.MOUSE_UP = 2;
    Event.MOUSE_OUT = 3;
    Event.MOUSE_IN = 4;
    Event.MOUSE_CLICK = 5;
    
    // 手势
    Event.GESTURE_DRAG = 7;
    Event.GESTURE_SWIPE = 8;
    Event.GESTURE_DRAG_END = 9

    // 系统事件
    Event.ENTER_FRAME = 100;

    Event.SWIPE_LEFT = -1;
    Event.SWIPE_RIGHT = 1;

    Event.enterObject = null;
    Event.enterEvent = null;
    Event.dragObject = null;
    Event.swipeObject = null;
    Event.moved = false;

    Event.clickAllowOffset = 40;
    Event.swipeAllowSpeed = 0.7;
    Event.swipeAllowSpeedCounter = 1;
    Event.swipeSpeedCounter = 0;
    Event.swipeDirection = null;

    roseCore.Event = Event;
})();
