typedef struct
{
    float r,g,b,a;
}Color4f;

typedef struct
{
    float x,y,w,h;
}Rect4f;

typedef enum {
    MOUSE_DOWN = 1,
    MOUSE_MOVE = 2,
    MOUSE_UP = 3
}EventType;

class Event
{
    public:
        EventType type;
};


class DisplayObject
{
    public:
        virtual void render() = 0;
        virtual ~DisplayObject() = 0;
};

inline DisplayObject::~DisplayObject(){}

class Texture : public DisplayObject
{
    public:
        int textureId;

        float sx;
        float sy;
        float sw;
        float sh;

        float dx;
        float dy;
        float dw;
        float dh;

    public:
        MovieClip *parent; 

    public:
        virtual void render();

};

class FillRect : public DisplayObject
{
    public:
        float x;
        float y;
        float w;
        float h;

    private:
        Color4f m_color;
    
    public:
        // RGBA
        string & get_color();
        void set_color(string color);

    public:
        MovieClip *parent;

    public:
        virtual void render();
};

class MovieClip : public DisplayObject
{
    public:
        float x;
        float y;
        string name;
        bool visible;
        float rotation;
        float scaleX;
        float scaleY;
        float alpha;
        float frameSpeed;
        Rect4f clipRect;

    private:
        unsigned int totalFrames;
        unsigned int currentFrame;
        //frameSpeed = global.gameFPS / global.renderFPS;
        float frameFloatCursor;
        bool isStoped;
        bool useAlphaTest;
        map<EventType, vector<EventCallback*> > eventBubbleCallBack;
        vector< vector<DisplayObject*> > frames;

    public:
        MovieClip *parent;
        
    public:
        MovieClip(name="", frameCounts=1) : name(name),totalFrames(frameCounts){
            x = 0;
            y = 0;
            visible = true;
            rotation = 0;
            scaleX = 1;
            scaleY = 1;
            alpha = 1.0;
            frameSpeed = 1/60;
            clipRect = {0, 0, 0, 0};
            currentFrame = 1;
            frameFloatCursor = 0;
            isStoped = false;
            useAlphaTest = false;
            
            for( int i=0; i<=totalFrames; i++ ) {
                frames.push_back(vector<DisplayObject*>());
            };
        }

        virtual void render();

        // 停止播放当前MovieClip,不影响子节点是否播放
        void stop(){
            isStoped = true;
        };

        // 播放当前MovieClip,不影响子节点是否播放
        void play() {
            isStoped = false
        };

        /* 跳到指定帧,并停止播放
         * @param currentFrame: 指定停止的帧位置 1/2
         */
        void gotoAndStop(unsigned int frame) {
            gotoFrame(currentFrame);
            stop();
        };

        /* 跳到指定帧,并开始播放
         * @param currentFrame: 指定停止的帧位置 1/2
         */
        void gotoAndPlay(unsigned int frame) {
            gotoFrame(currentFrame);
            play();
        }

        /* 停在时间轴头部
         * @param isRecursive: 是否递归到子节点
         */
        void stopAtHead(bool isRecursive=false);

        // 播放下一帧
        void nextFrame() {
            gotoFrame(currentFrame + 1);
        }

        // 播放上一帧
        void prevFrame() {
            gotoFrame(currentFrame - 1);
        }

        /* 添加子节点(放到容器最尾端)
         * @param mc: 子节点对象 MovieClip/Texture/FillRect/TextField
         */
        void addChild(DisplayObject *obj);

        /* 根据层次位置添加子节点
         * @param mc: 子节点对象 MovieClip/Texture/FillRect/TextField
         * @param addIndex: 子节点所在层次
         */
        void addChildAt(DisplayObject *obj, unsigned int frameIndex);


        // 获取当前帧所有子节点
        vector<DisplayObject *> & getChildren() {
            return frames[currentFrame];
        }

        /* 根据名字来获取子节点(只能获取MovieClip)
         * 如果有多个重名的子节点,返回第一个(禁止素材中出现多个重名的子节点)
         * @param name: 子节点名字 child1
         */
        DisplayObject * getChildByName(const string &name);

        /* 根据位置获取子节点
         * @param index: 位置 0/1/2
         */
        DisplayObject * getChildAt(unsigned int index);

        /* 根据名字来删除子节点(只能获取MovieClip)
         * 如果有多个重名的子节点,都会删除(禁止素材中出现多个重名的子节点)
         * @param name: 子节点名字 child1
         */

        void removeChildByName(const string &name);

        /* 删除子节点
         * @param child: 子节点对象
         */
        void removeChild(DisplayObject *obj);

        /* 删除子节点,根据位置
         * @param index: 子节点位置
         */
        void removeChildAt(unsigned int index);

        // 删除所有子节点
        void removeAllChild();

        // 从父节点中删除自己
        void removeFromParent();

        // 获取宽度
        float getWidth();

        // 获取高度
        float getHeight();

        // 增加事件监听
        void addEventListener(EventType type, EventCallback *callbak);

        /* 卸载事件监听
         * @param callback: 如果callback=NULL,会删除所有该类型事件
         */
        void removeEventListener(EventType type, EventCallback *callback = NULL);
        
        // 卸载所有事件
        void removeAllEventListener();

        /* 点碰撞检测
         * 如果开启Alpha测试,会传递给子节点
         */
        DisplayObject * hitTest(float x, float y, bool useAlphaTest = false);

        /* 冒泡事件
         * 从子节点到父节点,递归到舞台
         */
        void bubbleEvent(const Event *e);

        /* 触发一个事件
         * 会调用该MovieClip所挂载的所有该事件类型对应的回调
         */
        void triggerEvent(const Event *e);

        /* 找到冒泡某个事件对应的第一个响应MovieClip
         * @param eventType: 事件类型 GESTURE_DRAG/GESTURE_SWIPE
         */
        void bubbleFirstResponser(EventType type);

        // 让MovieClip只播放一次,不循环
        void playOnce();

    private:
        void gotoFrame(unsigned int frame);
        void renderFrame();
};

void MovieClip::stopAtHead(isRecursive) {
    gotoAndStop(1);
    if( !isRecursive ) return;

    vector<DisplayObject *> &children = frames[currentFrame];
    for( int i=0,max=children.size(); i<max; i++ ) {
        DisplayObject *child = children[i]; 
        if( typeid(*child) == typeid(MovieClip) ) {
            child->stopAtHead(isRecursive);
        }
    }
}

void MovieClip::addChild(DisplayObject *obj) {
    if( !obj ) return;
    if( obj->parent ) {
        obj->parent.removeChild(obj);
    }
    
    frames[currentFrame].push_back(obj);
    obj->parent = this;
}

void MovieClip::addChildAt(DisplayObject *obj, unsigned int frameIndex) {
    if( !obj ) return;
    if( obj->parent ) {
        obj->parent.removeChild(obj);
    }

    vector<DisplayObject *> &children = frames[currentFrame];
    children.insert(children.begin() + frameIndex, obj);
    obj->parent = this;
}

DisplayObject * MovieClip::getChildByName(const string &name) {
    vector<DisplayObject *> &children = frames[currentFrame];
    for( int i=0,max=children.size(); i<max; i++ ) {
        DisplayObject *child = children[i];
        if( typeid(*child) == typeid(MovieClip) && child->name == name ) {
            return child;
        }
    }

    return NULL;
}

DisplayObject * MovieClip::getChildAt(unsigned int index) {
    vector<DisplayObject *> &children = frames[currentFrame];
    if( index < 0 || index >= children.size() ) {
        return NULL;
    }

    return children[index];
}

void MovieClip::removeChildByName(const string &name) {
    vector<DisplayObject *> &children = frames[currentFrame];
    for( int i=0,max=children.size(); i<max; i++ ) {
        DisplayObject *child = children[i];
        if( typeid(*child) == typeid(MovieClip) && child->name == name ) {
            children.erase(children.begin() + i);
            return;
        }
    }
}

void MovieClip::removeChild(DisplayObject *obj) {
    if( !obj ) return;

    vector<DisplayObject *> &children = frames[currentFrame];
    vector<DisplayObject *>::iterator it = find(children.begin(), children.end(), obj);
    if( it != children.end() ) {
        children.erase(it);
    }
}

void MovieClip::removeChildAt(unsigned int index) {
    vector<DisplayObject *> &children = frames[currentFrame];
    if( index < 0 || index >= children.size() ) return;

    children.erase(children.begin() + index);
}

void MovieClip::removeAllChild() {
    vector<DisplayObject *> &children = frames[currentFrame];
    children.clear();
}

void MovieClip::removeFromParent() {
    if( !parent ) return;

    parent.removeChild(this);
}

float MovieClip::getWidth() {
    return 100;
}

float MovieClip::getHeight() {
    return 100;
}

void MovieClip::addEventListener(EventType type, EventCallback *callbak) {
    if( eventBubbleCallBack.find(type) == eventBubbleCallBack.end() ) {
        eventBubbleCallBack[type] = vector<EventCallback *>();
    }
    callbackHash[type].push_back(callback)
}

void MovieClip::removeEventListener(EventType type, EventCallback *callbak) {
    if( eventBubbleCallBack.find(type) == eventBubbleCallBack.end() ) return;

    if( callback ) {
        vector<EventCallback *> &callbacks = eventBubbleCallBack[type];
        vector<EventCallback *>::iterator it = find(callbacks.begin(), callbacks.end(), callback);
        if( it != callbacks.end() ) {
            callbacks.erase(it);
        }
    }else {
        eventBubbleCallBack[type].clear();
    }
}

void MovieClip::removeAllEventListener() {
    eventBubbleCallBack.clear();
}

DisplayObject * hitTest(float x, float y, bool useAlphaTest);
}

void MovieClip::bubbleEvent(Event *e) {
        triggerEvent(e);

        // 如果事件触发中停止了事件冒泡,则停止
        if (e.isStoped) {
            return;
        }

        if( parent ) {
            parent.bubbleEvent(e);
        }
}

void MovieClip::triggerEvent(const Event *e);
    if( eventBubbleCallBack.find(e->type) != eventBubbleCallBack.end() ) {
        vector<EventCallback *> &callbacks = eventBubbleCallBack[e->type];
        for( int i=0,max=callbacks.size(); i<max; i++ ) {
            callbacks[i](this);
        }
    }
    // 主动停止冒泡
    e->isStoped = true;
}

void MovieClip::bubbleFirstResponser(EventType type) {
}

void MovieClip::gotoFrame(unsigned int frame) {
    if( frame < 1 ) {
        currentFrame = totalFrames;
    }else if( frame > totalFrames ) {
        currentFrame = 1;
    }else {
        currentFrame = frame;
    }
    frameFloatCursor = currentFrame;
}

void MovieClip::render() {
    if( !visible || scaleX == 0 || scaleY == 0 ) {
        return;
    }

    // 处理ENTER_FRAME事件
    if( eventBubbleCallBack.find(Event.ENTER_FRAME) != eventBubbleCallBack.end()) {
        vector<EventCallback *> &callbacks = eventBubbleCallBack[Event.ENTER_FRAME];
        for( int i=0,max=callbacks.size(); i<max; i++ ) {
            callbacks[i](this);
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

