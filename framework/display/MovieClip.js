/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-15
 * Time: 上午11:10
 *
 */

(function () {
    
    var matrix = {a:1, d:1, tx:0, ty:0};

    var proto = MovieClip.prototype;

    function MovieClip(name, frameCount) {
        // 逻辑相关
        this.name = name || "MovieClip";
        this.totalFrames = frameCount || 1;
        this.currentFrame = 1;
        this.frameFloatCursor = 1;
        this.isStoped = false;
        this.useAlphaTest = false; // 默认不开启Alpha测试

        // 显示相关
        this.visible = true;
        this.x = 0;
        this.y = 0;
//        this.rotation = 0;
//        this.flipOffsetX = 0;
//        this.flipOffsetY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.alpha = 1;
        this.clipRect = null; // {x,y,w,h}
        this.frameSpeed = global.gameFPS / global.renderFPS;

        // 事件相关
        this.isSwallowTouch = false;
        this.eventCaptureCallBack = {};
        this.eventBubbleCallBack = {};
        this.parent = null;

        // 功能相关
        this._isButton = false;
        this._isEnabled = false;
        this._onClick = null;

        // 外带数据
        this.data = {};

        // 异步加载图片,MovieClip
        this._asyncImage = null;
        this._asyncMovieClip = null;
        // 异步加载对应的锁
        this._asyncImageCounter = 0;
        this._asyncMovieClipCounter = 0;

        this.frames = [
            null   // 占位符,这样就可以直接使用this.frames[framecursor]
        ];
        for (var i = 1; i <= this.totalFrames; i++) {
            this.frames.push([]);
        }
    }

    /* 停止播放当前MovieClip,不影响子节点是否播放
     */
    proto.stop = function () {
        this.isStoped = true;
    };

    /* 播放当前MovieClip,不影响子节点是否播放
     */
    proto.play = function () {
        this.isStoped = false;
    };

    /* 跳到指定帧,并停止播放
     * @param currentFrame: 指定停止的帧位置 1/2
     */
    proto.gotoAndStop = function (currentFrame) {
        this._goto(currentFrame);
        this.stop();
    };

    /* 跳到指定帧,并开始播放
     * @param currentFrame: 指定停止的帧位置 1/2
     */
    proto.gotoAndPlay = function (currentFrame) {
        this._goto(currentFrame);
        this.play();
    };

    /* 停在时间轴头部
     * @param isRecursive: 是否递归到子节点
     */
    proto.stopAtHead = function (isRecursive) {
        this.gotoAndStop(1);
        if (isRecursive) {
            var children = this.frames[this.currentFrame];
            for (var n = 0, m = children.length; n < m; n++) {
                var child = children[n];
                if (child instanceof MovieClip) {
                    child.stopAtHead(isRecursive);
                }
            }
        }
    };

    /* 播放下一帧
     */
    proto.nextFrame = function () {
        this._goto(this.currentFrame + 1);
    };

    /* 播放上一帧
     */
    proto.prevFrame = function () {
        this._goto(this.currentFrame - 1);
    };

    /* 添加子节点(放到容器最尾端)
     * @param mc: 子节点对象 MovieClip/Texture/FillRect/TextField
     */
    proto.addChild = function (mc) {
        if (!mc) return false;

        mc.parent && mc.parent.removeChild(mc);
        this.frames[this.currentFrame].push(mc);
        mc.parent = this;

        return true;
    };

    /* 根据层次位置添加子节点
     * @param mc: 子节点对象 MovieClip/Texture/FillRect/TextField
     * @param addIndex: 子节点所在层次
     */
    proto.addChildAt = function (mc, addIndex) {
        if (!mc) return false;

        mc.parent && mc.parent.removeChild(mc);
        this.frames[this.currentFrame].splice(addIndex, 0, mc);
        mc.parent = this;

        return true;
    };

    /* 获取当前帧所有子节点容器
     */
    proto.getCurrentFrame = function () {
        return this.frames[this.currentFrame];
    };

    /*获取所有子节点
    */
    proto.getChildren = function(){
        return this.frames[this.currentFrame];
    };

    /* 根据名字来获取子节点(只能获取MovieClip)
     * 如果有多个重名的子节点,返回第一个(禁止素材中出现多个重名的子节点)
     * @param name: 子节点名字 child1
     */
    proto.getChildByName = function (name) {
        var children = this.frames[this.currentFrame];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.name && (child.name === name)) {
                return child;
            }
        }
        return null;
    };

    /* 根据索引层次获取子节点
     * @param index: 层次位置 0/1/2
     */
    proto.getChildAt = function (index) {
        var children = this.frames[this.currentFrame];
        if (index < 0 || index >= children.length) {
            return null;
        }

        return children[index];
    };

    /* 根据path来获取其子节点: child1/child2
     * @param path: 名字路径 child1/child2
     */
    proto.getChildByPath = function (path) {
        if (!path) return;
        var dir = path.split('/');
        var ret = this;
        for (var i = 0; i < dir.length; ++i) {
            ret = ret.getChildByName(dir[i]);
            if (!ret) break;
        }
        return ret;
    };


    /* 根据名字来删除子节点(只能获取MovieClip)
     * 如果有多个重名的子节点,都会删除(禁止素材中出现多个重名的子节点)
     * @param name: 子节点名字 child1
     */
    proto.removeChildByName = function (name) {
        if (!name) return;

        var children = this.frames[this.currentFrame];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.name && (child.name === name)) {
                children.splice(i, 1);
                return child;
            }
        }

        return null;
    };

    /* 删除子节点
     * @param child: 子节点对象
     */
    proto.removeChild = function (child) {
        if (!child) return;
        var children = this.frames[this.currentFrame];
        var index = children.indexOf(child);
        if (index > -1) {
            children.splice(index, 1);
        }
        return null;
    };

    /* 删除子节点,根据位置
     * @param index: 子节点位置
     */
    proto.removeChildAt = function (index) {
        if(index < 0) return;
        var children = this.frames[this.currentFrame];
        if( index >= children.length ) return;

        return children.splice(index, 1)[0];
    };

    /* 删除所有子节点
     */
    proto.removeAllChild = function () {
        this.totalFrames = 1;
        this.currentFrame = 1;
        this.frameFloatCursor = 1;
        this.frames = [
            [],
            []
        ];
    };


    /* 从父节点中删除自己
     */
    proto.removeFromParent = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    /* 获取宽度
     * @todo 有待优化
     */
    proto.getWidth = function () {
        var currentFrame = this.getCurrentFrame();
        var mc;
        var width = 0;
        var maxWidth = 0;
        for (var n = 0, m = currentFrame.length; n < m; n++) {
            mc = currentFrame[n];
            if (mc instanceof MovieClip) {
                width = mc.getWidth();
            } else if (mc instanceof Texture || mc instanceof FillRect) {
                width = mc.dw;
            }
            maxWidth = Math.max(maxWidth, width);
        }
        return maxWidth;
    };

    /* 获取高度
     * @todo 有待优化
     */
    proto.getHeight = function () {
        var currentFrame = this.getCurrentFrame();
        var mc;
        var height = 0;
        var maxHeight = 0;
        for (var n = 0, m = currentFrame.length; n < m; n++) {
            mc = currentFrame[n];
            if (mc instanceof MovieClip) {
                height = mc.getHeight();
            } else if (mc instanceof Texture || mc instanceof FillRect) {
                height = mc.dh;
            }
            maxHeight = Math.max(maxHeight, height);
        }
        return maxHeight;
    };

    /* 渲染
     */
    proto.render = function () {
        if (!this.visible || this.scaleX == 0 || this.scaleY == 0 ) {
            return;
        }

        // 处理ENTER_FRAME事件
        var callbackArr = this.eventBubbleCallBack[Event.ENTER_FRAME];
        if (callbackArr && callbackArr.length > 0) {
            for (var n = 0, m = callbackArr.length; n < m; n++) {
                callbackArr[n].call(this);
            }
        }
        
        var changeAlpha = false;
        var savedAlpha = global.context2d.globalAlpha;
        if (this.alpha < 1 && this.alpha != global.context2d.globalAlpha) {
            changeAlpha = true;
            global.context2d.globalAlpha = this.alpha;
        }

        matrix.tx += matrix.a * this.x;
        matrix.ty += matrix.d * this.y;

        if( this.scaleX != 1 || this.scaleY != 1 ) {
            matrix.a *= this.scaleX;
            matrix.d *= this.scaleY;
        }

        var handleFlipOffset = false;
        if ( (this.flipOffsetX || this.flipOffsetY) && (this.scaleX != 1 || this.scaleY != 1) 
            && (this.scaleX < 0 || this.scaleY < 0 ) ) {
            
            handleFlipOffset = true;
            this.flipOffsetX = this.flipOffsetX || 0;
            this.flipOffsetY = this.flipOffsetY || 0;
            
            matrix.tx += matrix.a * this.flipOffsetX;
            matrix.ty += matrix.d * this.flipOffsetY;
        }

        if (this.clipRect) {
            var px = matrix.a * this.clipRect.x + matrix.tx;
            var py = matrix.d * this.clipRect.y + matrix.ty;

            if (global.isInBrowser) {
                global.context2d.save();
                global.context2d.beginPath();
                global.context2d.rect(
                    px,
                    py,
                    this.clipRect.w,
                    this.clipRect.h);
                global.isShowRect && global.context2d.stroke();
                global.context2d.closePath();
                global.context2d.clip();
            } else {
                global.context2d.setClipRect(
                    px,
                    py,
                    this.clipRect.w,
                    this.clipRect.h);
            }
        }

        var frames = this.frames[this.currentFrame];
        for (var i = 0, j = frames.length - 1; i <= j; i++) {
            var child = frames[i];
            if( !child ) {
                continue;
            }

            if (child instanceof MovieClip) {
                child.render();
            } else if (child instanceof TextField) {
                child.render(matrix.tx, matrix.ty);
            } else if (child instanceof Texture && child.img) {
                var texture = child;

                var px = matrix.a * texture.dx + matrix.tx;
                var py = matrix.d * texture.dy + matrix.ty;

                // 处理缩放,旋转问题
                var specialTransform = false;
                if (matrix.a != 1 || matrix.d != 1) {
                    specialTransform = true;
                }

                if (texture.rotation && (texture.rotation % 360 != 0)) {
                    specialTransform = true;
                }

                if (specialTransform) {
                    global.context2d.save();
                    global.context2d.translate(px, py);

                    if (matrix.a != 1 || matrix.d != 1) {
                        global.context2d.scale(matrix.a, matrix.d);
                    }
                    if (texture.rotation) {
                        var cx = texture.dw * Math.abs(matrix.a) / 2;
                        var cy = texture.dh * Math.abs(matrix.a) / 2;
                        global.context2d.translate(cx, cy);
                        global.context2d.rotate(texture.rotation / 180 * Math.PI);
                        global.context2d.translate(-cx, -cy);
                    }

                    global.context2d.drawImage(texture.img, texture.sx, texture.sy, texture.sw, texture.sh,
                        0, 0, texture.dw, texture.dh);
                    if (global.isInBrowser && global.isShowRect) {
                        global.context2d.beginPath();
                        global.context2d.rect(0, 0, texture.dw, texture.dh);
                        global.context2d.stroke();
                        global.context2d.closePath();
                    }
                    global.context2d.restore();
                } else {
                    global.context2d.drawImage(texture.img, texture.sx, texture.sy, texture.sw, texture.sh,
                                        px, py, texture.dw, texture.dh);
                    if (global.isInBrowser && global.isShowRect) {
                        global.context2d.beginPath();
                        global.context2d.rect(px, py, texture.dw, texture.dh);
                        global.context2d.stroke();
                        global.context2d.closePath();
                    }
                }

                texture.bounds.x = px;
                texture.bounds.y = py;
                texture.bounds.w = matrix.a * texture.dw;
                texture.bounds.h = matrix.d * texture.dh;

            } else if (child instanceof FillRect) {
                var px = matrix.a * child.x + matrix.tx;
                var py = matrix.d * child.y + matrix.ty;

                var fillStyle = global.context2d.fillStyle;
                var globalAlpha = global.context2d.globalAlpha;

                global.context2d.fillStyle = child.color;
                global.context2d.globalAlpha = child.alpha;

                child.bounds.x = px;
                child.bounds.y = py;
                child.bounds.w = matrix.a * child.w;
                child.bounds.h = matrix.d * child.h;

                global.context2d.fillRect(px, py, child.bounds.w + 1, child.bounds.h + 1);

                global.context2d.fillStyle = fillStyle;
                global.context2d.globalAlpha = globalAlpha;
            }

            if( child.bounds && child.bounds.w < 0 ) {
                child.bounds.x += child.bounds.w;
                child.bounds.w = - child.bounds.w;
            }

            if( child.bounds && child.bounds.h < 0 ) {
                child.bounds.y += child.bounds.h;
                child.bounds.h = -child.bounds.h;
            }
        }

        if (!this.isStoped) {
            this._renderFrame();
        }

        if (this.clipRect) {
            if (global.isInBrowser) {
                global.context2d.restore();
            } else {
                global.context2d.resetClipRect();
            }
        }

        if( handleFlipOffset ) {
            matrix.tx -= matrix.a * this.flipOffsetX;
            matrix.ty -= matrix.d * this.flipOffsetY;
        }

        if( this.scaleX != 1 ) {
            matrix.a /= this.scaleX;
        }
        if( this.scaleY != 1 ) {
            matrix.d /= this.scaleY;
        }

        matrix.tx -= matrix.a * this.x;
        matrix.ty -= matrix.d * this.y;


        changeAlpha && (global.context2d.globalAlpha = savedAlpha);
    };

    /* 增加事件监听
     */
    proto.addEventListener = function (eventType, callback, useCapture) {
        var callbackHash;
        if (useCapture) {
            callbackHash = this.eventCaptureCallBack;
        } else {
            callbackHash = this.eventBubbleCallBack;
        }
        if (!callbackHash[eventType]) {
            callbackHash[eventType] = [];
        }
        callbackHash[eventType].push(callback)
    };

    /* 卸载事件监听
     */
    proto.removeEventListener = function (eventType, callback, useCapture) {
        var callbackHash;
        if (useCapture) {
            callbackHash = this.eventCaptureCallBack;
        } else {
            callbackHash = this.eventBubbleCallBack;
        }
        if (!callbackHash[eventType]) {
            callbackHash[eventType] = [];
        }
        var arr = callbackHash[eventType];
        if( callback ) {
            var index = arr.indexOf(callback)
            if (index > -1) {
                arr.splice(index, 1);
            }
        }else {
            callbackHash[eventType] = [];
        }
    };

    proto.removeAllEventListener = function () {
        this.eventBubbleCallBack = {};
        this.eventBubbleCallBack = {};
    }

    /* 点碰撞检测
     * 如果开启Alpha测试,会传递给子节点
     */
    proto.hitTest = function (x, y, useAlphaTest) {
        useAlphaTest = useAlphaTest || this.useAlphaTest;
        var childNodes = this.getCurrentFrame();
        for (var m = childNodes.length - 1; m >= 0; m--) {
            var child = childNodes[m];
            if( !child ) {
                continue;
            }

            if (child instanceof MovieClip) {
                if (!child.visible) {
                    continue;
                }

                var hitResult = child.hitTest(x, y, useAlphaTest);
                if (hitResult) {
                    return hitResult;
                }
            } else if (child instanceof Texture || child instanceof FillRect || child instanceof TextField) {

                if( !child.bounds ) {
                    return;
                }

                var bounds = child.bounds;

                if( x>= bounds.x && x <= (bounds.x + bounds.w) 
                    && y >= bounds.y && y<=(bounds.y + bounds.h) ) {

                    if (!useAlphaTest) {
                        return this;
                    }

                    var offsetX = Math.ceil(x-bounds.x);
                    var offsetY = Math.ceil(y-bounds.y);

                    var alphaTested = true;
                    if (child instanceof FillRect) {
                        alphaTested = (child.alpha > 0.02);
                    } else if (child instanceof Texture && child.img.alphaTest) {
                        alphaTested = child.img.alphaTest(child.sx + offsetX, child.sy + offsetY);
                    }

                    if (alphaTested) {
                        return this;
                    }
                }
            }
        }

        return null;
    };

    /* 冒泡事件
     * 从子节点到父节点,递归到舞台
     */
    proto.bubbleEvent = function (e) {

        this.triggerEvent(e);

        // 如果事件触发中停止了事件冒泡,则停止
        if (e.isStoped) {
            return;
        }

        if (this.parent && !this.isSwallowTouch) {
            this.parent.bubbleEvent(e);
        }
    };

    /* 触发一个事件
     * 会调用该MovieClip所挂载的所有该事件类型对应的回调
     */
    proto.triggerEvent = function (e) {
        if (this.eventBubbleCallBack && this.eventBubbleCallBack[e.type]) {
            var callbackArr = this.eventBubbleCallBack[e.type];
            for (var i = 0, max = callbackArr.length; i < max; i++) {
                callbackArr[i].call(this, e);
            }
            
            // 主动停止冒泡
            e.isStoped = true;
        }
    };

    /* 找到冒泡某个事件对应的第一个响应MovieClip
     * @param eventType: 事件类型 GESTURE_DRAG/GESTURE_SWIPE
     */
    proto.bubbleFirstResponser = function (eventType) {

        if (this.eventBubbleCallBack && this.eventBubbleCallBack[eventType]) {
            return this;
        }

        if (this.parent && !this.isSwallowTouch) {
            return this.parent.bubbleFirstResponser(eventType);
        }

        return null;
    };

    /* 阻止事件冒泡
     */
    proto.setIsSwallowTouch = function (isSwallowTouch) {
        this.isSwallowTouch = isSwallowTouch || false;
    };

    /* 是否开启Alpha测试
     */
    proto.setUseAlphaTest = function (useAlphaTest) {
        this.useAlphaTest = useAlphaTest || false;
    };

    /* 按钮点下回调
     */
    proto._buttonDownHandler = function (e) {
        if (this._isEnabled) {
            this.gotoAndStop(2);
        }
    };

    /* 按钮松开回调
     */
    proto._buttonUpHandler = function (e) {
        if (this._isEnabled) {
            this.gotoAndStop(1);
        }
    };

    /* 设置点击后回调函数
     * 不与已经挂载的MOUSE_CLICK事件冲突
     */
    proto.setOnClick = function (onClick) {
        this._onClick && this.removeEventListener(Event.MOUSE_CLICK, this._onClick);
        this._onClick = null;
        if (onClick) {
            this._onClick = function (e) {
                if (this._isButton && !this._isEnabled) return;
                global.soundManager.playEffect('mouse_rollover.mp3');
                onClick(e);
                if (!this.visible && this._isButton) this.gotoAndStop(1);
            }.bind(this);
        }
        this._onClick && this.addEventListener(Event.MOUSE_CLICK, this._onClick);
    };

    /* 设置一个动态加载的图片
     * 如果没有设置过,加载一个图片并添加到子节点
     * @param path: 动态图片url, 不设置会替换原来已经设置的图片
     * @param defaultIcon: 加载不成功的默认图片
     * @param callback: 设置完毕后的回调 callback(img)
     */
    proto.setImage = function (path, defaultImage, callback) {
        if (!path) {
			if (this._asyncImage) {
				this.removeChild(this._asyncImage);
				textureLoader.unloadImage(this._asyncImage.img);
				this._asyncImage = null;
			}
			return;
		}

        // 计数器,用来控制并发
        this._asyncImageCounter++;
        var savedAsyncImageCounter = this._asyncImageCounter;

        textureLoader.loadImage(path, defaultImage, function (img) {
            if (this._asyncImageCounter != savedAsyncImageCounter) {
                return;
            }
			if( this._asyncImage ) {
				this.removeChild(this._asyncImage);
				textureLoader.unloadImage(this._asyncImage.img);
				this._asyncImage = null;
			}
            var texture = new Texture(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
            this.addChild(texture);
            this._asyncImage = texture;
            callback && callback(this._asyncImage);
        }.bind(this));
    };

    /* 设置一个动态加载的MovieClip,这里目前只支持按链接打包的素材
     * 如果没有设置过,加载一个MovieClip并添加到子节点
     * @param libName: 库名
     * @param linkName: 链接名
     * @param callback: 设置完毕后的回调 callback(mc)
     */
    proto.setMovieClip = function (libName, linkName, callback) {
        var isPacked = false;
        if (!libName || !linkName) {
            if (this._asyncMovieClip) {
                this.removeChild(this._asyncMovieClip);
                textureLoader.unloadLibrary(this._asyncMovieClip.libName, [this._asyncMovieClip.linkName]);
                this._asyncMovieClip = null;
            }
            return;
        }

        // 计数器,用来控制并发
        this._asyncMovieClipCounter++;
        var savedAsyncMovieClipCounter = this._asyncMovieClipCounter;

        var loadProcessor = new LoadProcessor(function () {
            if (this._asyncMovieClipCounter != savedAsyncMovieClipCounter) {
                return;
            }
            if (this._asyncMovieClip) {
                this.removeChild(this._asyncMovieClip);
                textureLoader.unloadLibrary(this._asyncMovieClip.libName, [this._asyncMovieClip.linkName]);
                this._asyncMovieClip = null;
            }

            this._asyncMovieClip = textureLoader.createMovieClip(libName, linkName);
            this.addChild(this._asyncMovieClip);

            this._asyncMovieClip.libName = libName;
            this._asyncMovieClip.linkName = linkName;

            callback && callback(this._asyncMovieClip);
        }.bind(this));

        textureLoader.loadLibrary(libName, [linkName], isPacked, loadProcessor);
        loadProcessor.start();
    };

    /* 设置为按钮
     * 按钮状态定义为: 4帧 默认,按下,松开,禁用
     * @param isButton: 是否设置为Button
     * @param onClick: 点击回调函数
     */
    proto.setButton = function (isButton, onClick) {
        if (isButton) {
            this._isButton = true;
            this.addEventListener(Event.MOUSE_DOWN, this._buttonDownHandler);
            this.addEventListener(Event.MOUSE_UP, this._buttonUpHandler);

            this.setOnClick(onClick);
            this.setIsEnabled(true);

            this.isSwallowTouch = true;
        } else {
            this._isButton = false;
            this.removeEventListener(Event.MOUSE_DOWN, this._buttonDownHandler);
            this.removeEventListener(Event.MOUSE_UP, this._buttonUpHandler);
            this.setOnClick();
            this.gotoAndStop(1);

            this.isSwallowTouch = false;
        }
    };

    /* 设置按钮是否可点击
     */
    proto.setIsEnabled = function (isEnable) {
        if (this._isButton) {
            this._isEnabled = isEnable;
            isEnable ? this.gotoAndStop(1) : this.gotoAndStop(4);
        }
    };

    /* 设置剪切区域
     * @param rect: 矩形区域{x,y,w,h}
     */
    proto.setClipRect = function (rect) {
        if (!rect) {
            this.clipRect = null;
        } else if (rect.hasOwnProperty("x") && rect.hasOwnProperty("y") &&
            rect.hasOwnProperty("w") && rect.hasOwnProperty("h")) {
            this.clipRect = rect;
        }
    };

    proto.nodePointToWorldPoint = function (point) {
        var cur = this;
        var ret = {x:0, y:0};
        while (cur) {
            ret.x += cur.x;
            ret.y += cur.y;
            cur = cur.parent;
        }

        if (point) {
            ret.x += point.x;
            ret.y += point.y;
        }
        return ret;
    };

    proto.worldPointToNodePoint = function (point) {
        var cur = this;
        var ret = {x:0, y:0};
        while (cur) {
            ret.x -= cur.x;
            ret.y -= cur.y;
            cur = cur.parent;
        }
        if (point) {
            ret.x += point.x;
            ret.y += point.y;
        }
        return ret;
    };

    /* 让MovieClip只播放一次,不循环
     */
    proto.playOnce = function () {
        this.isPlayOnce = true;
        this.visible = true;
        this.gotoAndPlay(1);
    };


    // 内部函数-----------------------------------------------

    proto._goto = function (frame) {
        if (frame < 1) {
            this.currentFrame = this.totalFrames;
        }
        else if (frame > this.totalFrames) {
            this.currentFrame = 1;
        }
        else {
            this.currentFrame = frame;
        }
        this.frameFloatCursor = this.currentFrame;
    };

    proto._renderFrame = function () {
        this.frameFloatCursor += this.frameSpeed;
        this.currentFrame = Math.floor(this.frameFloatCursor);
        if (this.currentFrame > this.totalFrames) {
            if (this.isPlayOnce) {
                this.gotoAndStop(1);
                this.isPlayOnce = false;
                this.visible = false;
            }
            this.currentFrame = 1;
            this.frameFloatCursor = 1;
        }
    };

    roseCore.MovieClip = MovieClip;

})();
