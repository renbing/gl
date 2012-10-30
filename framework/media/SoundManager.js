/**
 * Created by Bing Ren
 * User: Bing Ren
 * Date: 12-4-26
 * Time: 上午10:52
 *
 */

(function () {

    var proto = SoundManager.prototype;

    function SoundManager() {
        // 唯一一个背景音乐
        this.background = null;
        // 多个效果音
        this.effects = {};
        this.effectMuted = false;
        this.backgroundMuted = false;
    }

    proto.getIsBackgroundMuted = function () {
        return this.backgroundMuted;
    };

    proto.getIsEffectMuted = function () {
        return this.effectMuted;
    };


    proto.playBackground = function (newBackground) {
        if(!newBackground) return;

        if (!this.backgroundMuted) {

            this.background && this.background.stop();
            this.background = null;
            this.background = newBackground;
            this.background.play();
        }else{
            this.background = newBackground;
        }
    };

    proto.stopBackground = function (bClean) {
        this.background && this.background.stop();
        if(bClean) this.background = null;
    };

    proto.setIsBackgroundMusicEnabled = function (enabled) {
        this.backgroundMuted = !enabled;
        if (!enabled) {
            this.stopBackground();
        } else {
            this.background && this.background.play();
        }
    };

    proto.playEffect = function (name) {
        if (!this.effectMuted) {
            if (!(name in this.effects)) {
                this.effects[name] = new Sound(name, false);
            }
            this.effects[name].play();
        }
    };

    proto.stopEffects = function () {
        for (var name in this.effects) {
            this.effects[name].stop();
        }
        this.effects = {};
    };

    proto.setIsEffectEnabled = function(enabled){
        this.effectMuted = !enabled;
        if(!enabled){
            this.stopEffects();
        }
    };

    global.soundManager = new SoundManager();
})();
