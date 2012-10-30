/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-22
 * Time: 下午5:46
 *
 */

(function () {

    function _start(){
        if(!this.isDone)
            global.gameSchedule.scheduleUpdate(this);
        return this;
    }

    function _destory(){
        this.isDone = true;
        //global.gameSchedule.unscheduleUpdate(this);
    }

    function _addAction(val){
        if (typeof val == 'function'){
            val = new ActFunc(val);
        }
        this.actionList.add(val);
        return this;
    }

    function ActFunc(delegate)
    {
        this.isDone = false;
        this.delegate = delegate;
        this.start = _start;
        this.destory = _destory;
    }

    ActFunc.prototype.update = function(){
        if(this.isDone) return;
        this.delegate();
        this.isDone = true;
    };

    function ActDelay(delay){
        this.delay = delay || 0;
        this.start = _start;
        this.destory = _destory;
        this.isDone = false;

    }

    ActDelay.prototype.update = function(){
        if(this.isDone) return;
        this.delay -= global.loopInterval;
        if(this.delay <= 0) this.isDone = true;
    };

    function ActSeq() {
        this.actionList = global.createLinkList();
        this.isDone = false;
        this.onDestory = null;
        this.start = _start;
        this.destory = _destory;
        this.add = _addAction;
    }

    ActSeq.prototype.update = function () {
        if(this.isDone) return;
        var curRun = this.actionList.first;
        if(curRun){
            curRun.data.update();
            if (curRun.data.isDone) {
                this.actionList.delBehind(null);//删除第一个跑完的action
            }
        }
        if (curRun == null) {
            this.isDone = true;
        }
    };

    function ActSpawn() {
        this.actionList = global.createLinkList();
        this.isDone = false;
        this.onDestory = null;
        this.start = _start;
        this.destory = _destory;
        this.add = _addAction;
    }

    ActSpawn.prototype.update = function () {
        if(this.isDone) return;
        var next, cur = this.actionList.first;
        //遍历，防止在update函数中该元素被删除掉，导致遍历指针失效
        var isDone = true;
        while (cur != null){
            next = cur.next;
            if(!cur.data.isDone)
                cur.data.update();
            if(!cur.data.isDone)
                isDone = false;
            cur = next;
        }
        if(isDone){
            this.isDone = true;
        }
    };

    global.ActFunc = function (val){
        return new ActFunc(val);
    };

    global.ActDelay = function(delay){
        return new ActDelay(delay);
    };

    global.ActSeq = function(){
        var ret = new ActSeq();
        for(var i = 0; i<arguments.length; ++i){
            ret.add(arguments[i]);
        }
        return ret;
    };

    global.ActSpawn = function(){
        var ret = new ActSpawn();
        for(var i=0; i<arguments.length; ++i){
            ret.add(arguments[i]);
        }
        return ret;
    };
}());
