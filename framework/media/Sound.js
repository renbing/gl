/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-17
 * Time: 下午10:52
 *
 */

(function (){

    var proto = Sound.prototype;

    function Sound(name, isLoop){
        this.snd = new Audio();
        this.snd.src = global.mediaDirectory + name;
        this.snd.loop = !!isLoop;
    }

    proto.play = function(){
        this.snd.play();
    };

    proto.stop = function(){
//        this.snd.currentTime = 0;
        this.snd.pause();
    };

    proto.pause = function(){
        this.snd.pause();
    };


    roseCore.Sound = Sound;
})();
