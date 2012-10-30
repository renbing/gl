/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-22
 * Time: 上午10:32
 *
 */

(function () {

    function LinkList() {
        this.add = _add;
        this.del = _del;
        this.delBehind = _delBehind;
    }

    function _add(val) {
        if (val) {
            if (!this.first) {
                this.first = this.tail = {data:val, next:null};
            } else {
                this.tail = this.tail.next = {data:val, next:null};
            }
        }
    }

    function _del(val) {
        if (!val || !this.first) return;

        if (this.first.data == val) {
            if (this.first == this.tail) {
                this.tail = this.first = null;
            } else {
                this.first = this.first.next;
            }
            return;
        }

        var cur = this.first.next;
        var last = this.first;
        while (cur != null) {
            if (cur.data == val) {
                last.next = cur.next;
                break;
            }
            last = cur;
            cur = cur.next;
        }
    }

    /** 删除该节点之后的那个节点
     * @param node (warning)如果node为null，则为删除头结点
     */
    function _delBehind(node) {
        if (node) {
            if (node.next == this.tail) {
                this.tail = node;
                node.next = null;
            } else {
                node.next = node.next.next;
            }
        } else {
            this.first = this.first.next;
        }
    }

    global.createLinkList = function () {
        return new LinkList();
    }

    function gameSchedule() {
        this.actionList = global.createLinkList();
    }

    gameSchedule.prototype.scheduleUpdate = function (updateFunc) {
        this.actionList.add(updateFunc);
    };

    gameSchedule.prototype.unscheduleUpdate = function (updateFunc) {
        this.actionList.del(updateFunc);
    };

    gameSchedule.prototype.scheduleFunc = function (func, interval, bDoOnce) {
        if (!func) return;

        func.__interval = interval || 0;
        func.__passed = 0;
        func.__notUpdator = true;
        func.__bDoOnce = bDoOnce;
        this.actionList.add(func);
    };

    gameSchedule.prototype.unscheduleFunc = function (func) {
        if (func) {
            this.actionList.del(func);
        }
    };

    gameSchedule.prototype.update = function () {

        var next, cur = this.actionList.first;
        var last = null;
        var dt = global.loopInterval;
        while (cur != null)//遍历，防止在update函数中该元素被删除掉，导致遍历指针失效
        {
            next = cur.next;
            if (!cur.data.isDone) {
                if (cur.data.__notUpdator) {
                    cur.data.__passed += dt;
                    if (cur.data.__passed >= cur.data.__interval) {
                        cur.data.__passed -= cur.data.__interval;
                        cur.data();
                        if(cur.__bDoOnce) cur.isDone = true;
                    }
                } else {
                    if (cur.data.firstRun) {
                        cur.data.firstRun = false;
                    }
                    else
                        cur.data.update();
                }

            }
            if (cur.data.isDone) {
                this.actionList.delBehind(last);
            } else {
                last = cur;
            }

            cur = next;
        }
    };

    gameSchedule.prototype.unScheduleAll = function(){
        this.actionList = global.createLinkList();
    };

    global.gameSchedule = new gameSchedule();

})();
