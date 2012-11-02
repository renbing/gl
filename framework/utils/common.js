/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-4-1
 * Time: 上午10:10
 *
 */


(function () {

    var proto = Common.prototype;

    function Common() {
        this.timeDiff = 0;
        this.isDebug = true;
    }

    //return local seconds
    proto.getLocalTime = function () {
        return Math.round((+new Date() / 1000));
    };

    //return server seconds
    proto.getServerTime = function () {
        return this.getLocalTime() + this.timeDiff;
    };

    /// 将秒数转换为(小时:分钟:秒)的格式
    proto.second2stand = function (seconds) {
        var second = seconds % 60;
        var minites = Math.floor(seconds / 60);
        var minite = minites % 60;
        var hour = Math.floor(minites / 60);

        return this.formatNum(hour.toString(), 2) + ':' + this.formatNum(minite.toString(), 2) + ':' + this.formatNum(second.toString(), 2);
    };

    //将source字符串中不足length长度的前面补0
    proto.formatNum = function (Source, Length) {
        var strTemp = "";
        for (i = 1; i <= Length - Source.length; i++) {
            strTemp += "0";
        }
        return strTemp + Source;
    };

    proto.hour2Second = function (hour) {
        return hour * 3600;
    };

    proto.second2hour = function (second) {
        return ((second / 3600) | 0) + 1;
    };

    proto.numBetween = function (min, max, value) {
        if (value < min) value = min;
        else
        if (value > max) value = max;

        return value;
    };

    /// 将分钟转换为XX小时XX分钟的形式，如果不足一小时，则小时部分省略，如果时间小于或者等于0，则返回空字符串
    proto.min2hour = function (min) {
        if(min <= 0) return "";

        var hour = (min / 60) | 0;
        min = min % 60;
        var ret = '';
        if (hour != 0) {
            ret += (hour + '小时');
        }
        if (min != 0) {
            ret += (min + '分钟');
        }

        return ret;
    };

    proto.assert = function(condition, warningMsg){
        if(this.isDebug && !condition){
            warningMsg && global.dialog(warningMsg);
        }
    };

    proto.assertRes = function(condition, resname){
        this.assert(condition, "素材错误:缺少"+resname+"组件");
    };

    proto.test = function(func){
        if(this.isDebug && typeof(func) ==  'function'){
            func();
        }
    };

    proto.getConfig = function(filename){
        if(!filename) return;

        return global.configs[filename];
    };

    global.common = new Common();
})();
