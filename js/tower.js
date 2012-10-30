/**
 * Created by renbing
 * User: renbing
 * Date: 12-8-27
 * Time: 下午2:47
 *
 */

/**
 * 敌人管理器
 */

function TowerManager() {
    this.towers = {};
}

TowerManager.prototype.parse = function(name){
    if( name in this.towers ) {
        return;
    }
    
    this.towers[name] = {'main':{}, 'turret':{}, 'base':{}};
    
    var asc;
    var animations = {};
    if( global.towers[name][0] ) {
        asc = resourceManager.get("Tower_"+name+"_Turret.asc");
        animations = this.towers[name].turret;
    }else{
        asc = resourceManager.get("Tower_"+name+".asc");
        animations = this.towers[name].main;
    }

    var imgs = [];

    this._parse(asc, animations, imgs);

    if( global.towers[name][1] ) {
        asc = resourceManager.get("Tower_"+name+"_Base.asc");
        animations = this.towers[name].base;
        this._parse(asc, animations, imgs);
    }

    return imgs;
};

TowerManager.prototype._parse = function(asc, animations, imgs){
    lines = asc.data.split("\r\n");

    var img = null;
    var frames = [];
    var emptyLine = false;
    var orientation = 0;
    var level = "level1";
    var animType = "run";

    for(var i=0; i<lines.length; i++) {
        var line = lines[i];
        if(line.slice(0, 5) == "file ") {
            img = line.split(" ")[1];
            imgs.push(img);
        }

        if(line.slice(0, 5) == "anim " || line.slice(0, 12) == "orientation "
            || line.slice(0, 9) == "anim_set " ){
            if( frames.length > 0 ) {
                var key = [level, animType, orientation].join("_");
                animations[key] = frames;
            }

            frames = [];
        }

        if(line.slice(0, 9) == "anim_set ") {
            level = line.split(" ")[1];
        }

        if(line.slice(0, 5) == "anim ") {
            animType = line.split(" ")[1];
        }
        if(line.slice(0, 12) == "orientation ") {
            orientation = line.split(" ")[1];
        }

        if(emptyLine) {
            var segs = line.split(" ");
            if(segs.length == 6) {
                for(var j=0; j<6; j++) {
                    segs[j] = +segs[j];
                }
                segs.push(img);
                frames.push(segs);
            }
        }

        if(line == "") {
            emptyLine = true;
        }else{
            emptyLine = false;
        }
    }

    if(frames.length > 0 ) {
        var key = [level, animType, orientation].join("_");
        animations[key] = frames;
    }

};

TowerManager.prototype.get = function(name, level, anim, orientation) {
    var obj = this.towers[name];
    if( obj ) {
        var key = [level, anim, orientation].join("_");
        var mc = new MovieClip(key, 1);

        var frames;
        if( global.towers[name][1] ) {
            frames = obj.base[[level, "run", 0].join("_")];
            var base = this._createMovieClip("base", frames);
            mc.addChild(base);
        }

        if( global.towers[name][0] ) {
            frames = obj.turret[key];
        }else{
            frames = obj.main[key]
        }
        var main = this._createMovieClip("main", frames);
        mc.addChild(main);

        return mc;
    }

    return null;
};

TowerManager.prototype._createMovieClip = function(name, frames) {
    var mc = new MovieClip(name, frames.length);
    for(var i=0; i<frames.length; i++) {
        var segs = frames[i];
        mc.gotoAndStop(i+1);
        var img = resourceManager.get(segs[6]);
        mc.addChild(new Texture(img.data, +segs[1], +segs[2],
            +segs[3], +segs[4], -segs[3]/2.0, -segs[4]/2.0, +segs[3], +segs[4]));
        mc.gotoAndPlay(1);
    }
    return mc;
};
