/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-3-6
 * Time: 下午5:22
 *
 */

/**
 * 拖拽工具
 */
(function(){

    /**
     * 普通拖拽
     * @param oriObject
     * @param draggable
     * @param cfg
     */
    function drag(oriObject, draggable, cfg){
        if (!(oriObject instanceof MovieClip) && !(oriObject instanceof TextField)){
            return false;
        }
        cfg = cfg || {};
        if (draggable){
            if (cfg.inertiaScrollX){
                inertiaScrollX(oriObject, cfg.mainScene);
            }else{
                oriObject.addEventListener(Event.DRAG_START, handleDragStart);
                oriObject.addEventListener(Event.DRAG, handleDrag);
            }
        }else{
            oriObject.removeEventListener(Event.DRAG_START, handleDragStart);
            oriObject.removeEventListener(Event.DRAG, handleDrag);
        }
    }

    /**
     * 主场景拖拽用，需重构
     * @param oriObject
     */
    function inertiaScrollX(oriObject, mainScene){
        //边缘值
        var magicValue = global.GAME_WIDTH - 1524;

        mainScene.status = 'free';

        oriObject.addEventListener(Event.DRAG_START, function(e) {
            mainScene.dragOriX = mainScene.x;
            mainScene.tween && mainScene.tween.destroy();
            mainScene.tween = null;
            mainScene.lastX = mainScene.x;
        });
        oriObject.addEventListener(Event.DRAG, function(e) {
            var offsetX = mainScene.dragOriX + e.data.x;
            mainScene.inertiaSpeed = mainScene.x - mainScene.lastX;
            mainScene.lastX = mainScene.x;
            mainScene.dragTime = global.nowTime;
            if (offsetX < magicValue) {
                offsetX = magicValue + (offsetX - magicValue) / 2;
            } else if (offsetX > 0) {
                offsetX = offsetX / 2;
            }
            mainScene.x = offsetX;

        });
        oriObject.addEventListener(Event.DRAG_END, handlerDragEnd);

        oriObject.addEventListener(Event.MOUSE_DOWN, function(e) {
            stopInertanceMove();
            mainScene.tween && mainScene.tween.destroy();
        });

        function handlerDragEnd(e){
            var resetX;
            var needReset = false;
            if (mainScene.x < magicValue){
                resetX = magicValue;
                needReset = true;
            }
            if (mainScene.x > 0){
                resetX = 0;
                needReset = true;
            }
            if (needReset){
                mainScene.tween = Tween({
                    duration: 800,
                    trans: Tween.STRONG_EASE_OUT,
                    from: mainScene.x,
                    to: resetX,
                    func:function() {
                        mainScene.x = this.tween;
                    }
                }).start();
            }else{
                stopInertanceMove();
                mainScene.status = 'inertanceMove';
                mainScene.addEventListener(Event.ENTER_FRAME, inertanceMove);
            }
        }

        function inertanceMove(){
            var ratio = 0.95;
            if (mainScene.x < magicValue || mainScene.x > 0){
                ratio = 0.4;
            }
            mainScene.x += mainScene.inertiaSpeed;
            mainScene.inertiaSpeed *= ratio;
            if (Math.abs(mainScene.inertiaSpeed) < 0.5){
                handlerDragEnd();
                stopInertanceMove();
            }
        }

        function stopInertanceMove(){
            mainScene.removeEventListener(Event.ENTER_FRAME, inertanceMove);
            mainScene.status = 'free';
        }
    }

    /**
     * 拖拽开始句柄
     * @param e
     */
    function handleDragStart(e){
        this.dragOriX = this.x;
        this.dragOriY = this.y;
    }

    /**
     * 拖拽句柄
     * @param e
     */
    function handleDrag(e){
        this.x = this.dragOriX + e.data.x;
        this.y = this.dragOriY + e.data.y;
    }

    roseCore.drag = drag;

})();
