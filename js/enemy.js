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

function EnemyManager() {
    this.enemies = {};
}

EnemyManager.prototype.parse = function(name){
    if( name in this.enemies ) {
        return;
    }
    
    var animations = {};
    this.enemies[name] = animations;

    var asc = resourceManager.get("Enemy_"+name+".asc");
    lines = asc.data.split("\r\n");

    var img = null;
    var imgs = [];
    var frames = [];
    var emptyLine = false;
    var orientation = 0;
    var animType = "run";

    for(var i=0; i<lines.length; i++) {
        var line = lines[i];
        if(line.slice(0, 5) == "file ") {
            img = line.split(" ")[1];
            imgs.push(img);
        }

        if(line.slice(0, 5) == "anim " || line.slice(0, 12) == "orientation "){
            if( frames.length > 0 ) {
                animations[animType][orientation] = frames;
            }

            frames = [];
        }

        if(line.slice(0, 5) == "anim ") {
            animType = line.split(" ")[1];
            if( !animations[animType] ) {
                animations[animType] = {};
            }
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
        animations[animType][orientation] = frames;
    }

    return imgs;
};

EnemyManager.prototype.get = function(name, anim, orientation) {
    var obj = this.enemies[name];
    if( obj && obj[anim] && obj[anim][orientation] ) {
        var frames = obj[anim][orientation];
        var mc = new MovieClip([name,anim,orientation].join("_"), frames.length);
        for(var i=0; i<frames.length; i++) {
            var segs = frames[i];
            mc.gotoAndStop(i+1);
            var img = resourceManager.get(segs[6]);
            mc.addChild(new Texture(img.data, +segs[1], +segs[2],
                +segs[3], +segs[4], -segs[3]/2, -segs[4]/2, +segs[3], +segs[4]));
            mc.gotoAndPlay(1);
        }
        return mc;
    }

    return null;
};
