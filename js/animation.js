
/* running 和 shooting 均有8个方向
*/
function SoldierAnimation(id) {
    this.animations = {};

    var conf = global.Animations[id]; 
    for( var action in conf ) {
        var frameCount = conf[action][0];
        var frameX = conf[action][1][0];
        var frameY = conf[action][1][1];
        
        if( action == "running" || action == "shooting" ) {
            var framePerDirection = frameCount/8; 
            for( var i=0; i<8; i++ ) {
                var direction = i*45;
                var mc = new MovieClip(direction, framePerDirection);
                for( var j=1; j<=framePerDirection; j++ ) {
                    var pic = resourceManager.get("animations/" + id + "/" + action + "/" + action + "_" + (i*framePerDirection+j) + ".png");
                    mc.gotoAndStop(j);
                    mc.addChild(new Texture(pic));
                }
                mc.gotoAndPlay(1);
                this.animations[action + "_" + direction] = mc;
            }
        }else{
            var direction = "270"; 
            var mc = new MovieClip(direction, frameCount);
            for( var j=1; j<=frameCount; j++ ) {
                var pic = resourceManager.get("animations/" + id + "/" + action + "/" + action + "_" + j + ".png");
                mc.gotoAndStop(j);
                mc.addChild(new Texture(pic));
            }
            mc.gotoAndPlay(1);
            this.animations[action + "_" + direction] = mc;
        }
    }
}
