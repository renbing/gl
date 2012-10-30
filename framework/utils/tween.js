/**
 * @Author: Rui Luo | takuma888@126.com
 * @Overview: 补间管理
 * @Date: 2010/9/17
 * @alter:DeyongZ 计时器管理放到统一的gameSchedule里面
 */

/*
 Example:
 new Tween({
 duration: 1000,
 trans: 'simple',
 from: 200,
 to: 0,
 func:function() {
 var t = this.tween;
 leftView.viewRect = new Rect(t, leftView.viewRect.height);
 }});

 */

(function () {
    var transitions = {simple:function(time, startValue, changeValue, duration) {
        return changeValue * time / duration + startValue
    },backEaseIn:function(t, b, c, d) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b
    },backEaseOut:function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    },backEaseInOut:function(t, b, c, d, a, p) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
    },bounceEaseOut:function(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b
        }
    },bounceEaseIn:function(t, b, c, d) {
        return c - transitions.bounceEaseOut(d - t, 0, c, d) + b
    },bounceEaseInOut:function(t, b, c, d) {
        if (t < d / 2) {
            return transitions.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b
        } else {
            return transitions.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
        }
    },regularEaseIn:function(t, b, c, d) {
        return c * (t /= d) * t + b
    },regularEaseOut:function(t, b, c, d) {
        return-c * (t /= d) * (t - 2) + b
    },regularEaseInOut:function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b
        }
        return-c / 2 * ((--t) * (t - 2) - 1) + b
    },strongEaseIn:function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b
    },strongEaseOut:function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b
    },strongEaseInOut:function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
    },elasticEaseIn:function(t, b, c, d, a, p) {
        if (t == 0) {
            return b
        }
        if ((t /= d) == 1) {
            return b + c
        }
        if (!p) {
            p = d * 0.3
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else {
            var s = p / (2 * Math.PI) * Math.asin(c / a)
        }
        return-(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
    },elasticEaseOut:function(t, b, c, d, a, p) {
        var s;
        if (t == 0) {
            return b
        }
        if ((t /= d) == 1) {
            return b + c
        }
        if (!p) {
            p = d * 0.3
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a)
        }
        return(a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b)
    },elasticEaseInOut:function(t, b, c, d, a, p) {
        if (t == 0) {
            return b
        }
        if ((t /= d / 2) == 2) {
            return b + c
        }
        if (!p) {
            var p = d * (0.3 * 1.5)
        }
        if (!a || a < Math.abs(c)) {
            var a = c;
            var s = p / 4
        } else {
            var s = p / (2 * Math.PI) * Math.asin(c / a)
        }
        if (t < 1) {
            return-0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b
    },bezier:function(passed, from, to, duration){
        var percent = passed / duration;
        var left = 1-percent;
        return Math.pow(left, 3) * from + 3*this.p1*percent*Math.pow(left, 2) +
            3*this.p2*percent*percent*left + to*percent*percent*percent;
    }};

    /**
     * 缓动公式并回调
     * @param instance
     */
    function update() {
        if(this.isDone) return;
        this.passed += global.loopInterval;
        if(this.passed >= this.duration){
            this.passed = this.duration;
            this.isDone = true;
        }
        this.tween = transitions[this.trans](this.passed, this.from, this.to - this.from, this.duration);
        this.func();
    }

    /**
     * 将再不使用的对象析构
     * @param cfg
     */
    function _destroy() {
        this.isDone = true;
        //global.gameSchedule.unscheduleUpdate(this);
    }


    function _start(){
        if(!this.isDone)
            global.gameSchedule.scheduleUpdate(this);
        return this;
    }
    /**
     * 构造函数
     */
    function _Tween(cfg) {
        if (!cfg) return;
        this.from = cfg.from || 0;
        this.to = cfg.to === undefined ? 1 : cfg.to;
        this.trans = cfg.trans || 'simple';
        this.duration = cfg.duration === undefined ? 1000 : cfg.duration;
        this.p1 = cfg.p1 || 0;
        this.p2 = cfg.p2 || 0;
        this.func = cfg.func || function() {
        };
        this.passed = 0;
        this.update = update;
        this.destroy = _destroy;
        this.start = _start;
        this.firstRun = true;
        this.isDone = false;
    }


    //Tween.enabled = false;
    //Tween.loop = _loop;
    var Tween = function (cfg){
        return new _Tween(cfg);
    };

    Tween.SIMPLE = 'simple';
    Tween.BACK_EASE_IN = 'backEaseIn';
    Tween.BACK_EASE_OUT = 'backEaseOut';
    Tween.BACK_EASE_IN_OUT = 'backEaseInOut';
    Tween.BOUNCE_EASE_OUT = 'bounceEaseOut';
    Tween.BOUNCE_EASE_IN = 'bounceEaseIn';
    Tween.BOUNCE_EASE_IN_OUT = 'bounceEaseInOut';
    Tween.STRONG_EASE_IN_OUT = 'strongEaseInOut';
    Tween.REGULAR_EASE_IN = 'regularEaseIn';
    Tween.REGULAR_EASE_OUT = 'regularEaseOut';
    Tween.REGULAR_EASE_IN_OUT = 'regularEaseInOut';
    Tween.STRONG_EASE_IN = 'strongEaseIn';
    Tween.STRONG_EASE_OUT = 'strongEaseOut';
    Tween.STRONG_EASE_IN_OUT = 'strongEaseInOut';
    Tween.ELASTIC_EASE_IN = 'elasticEaseIn';
    Tween.ELASTIC_EASE_OUT = 'elasticEaseOut';
    Tween.ELASTIC_EASE_IN_OUT = 'elasticEaseInOut';
    Tween.BEZIER = 'bezier';
    
    roseCore.Tween = Tween;
})();
