/**
 * Created by renbing
 * User: renbing
 * Date: 12-10-30
 * Time: 下午2:47
 *
 */

/**
 * 地图
 */

function LogicMap(w, h) {
    this.data = new Array(w);
    for( var i=0; i<w; i++ ) {
        var row = new Array(h);
        for( var j=0; j<h; j++ ) {
            row[j] = 0;
        }
        this.data[i] = row;
    }
};

LogicMap.prototype.addRect = function(x, y, w, h) {
    for( var i=0; i<w; i++ ) {
        for( var j=0; j<h; j++ ) {
            this.data[x+i][y+j] = 1;
        }
    }
};

LogicMap.prototype.clearRect = function(x, y, w, h) {
    for( var i=0; i<w; i++ ) {
        for( var j=0; j<h; j++ ) {
            this.data[x+i][y+j] = 0;
        }
    }
};

/* 测试一个区域是否与已经存在的碰撞,碰撞返回true,否则false  
 */
LogicMap.prototype.testRect = function(x, y, w, h) {
    for( var i=0; i<w; i++ ) {
        for( var j=0; j<h; j++ ) {
            if( this.data[x+i][y+j] == 1 ) {
                return true;
            }
        }
    }

    return false;
};


function Building() {
    this.ux = 0;
    this.uy = 0;

    this.sux = 0;
    this.suy = 0;

    this.size = 0;

    this.dx = 0;
    this.dy = 0;

    this.addEventListener(Event.GESTURE_DRAG, function(e) {
        this.dx += e.data.x;
        this.dy += e.data.y;

        var fdux = (this.dx - 2 * this.dy) / 4 / global.Map.cellUnit;
        var fduy = (this.dx + 2 * this.dy) / 4 / global.Map.cellUnit;

        var dux = (fdux > 0 ? 1:-1) * Math.floor(Math.abs(fdux));
        var duy = (fduy > 0 ? 1:-1) * Math.floor(Math.abs(fduy));

        //trace(this.dx + ":" + this.dy + "," + dux + ":" + duy);

        if( dux == 0 && duy == 0 ) {
            return;
        }
        
        var ux = this.sux + dux;
        if( ux < 0 ) {
            ux = 0;
        }

        if( ux >= (global.Map.unitW - this.size) ) {
            ux = worldWidth - cellSize - 1;
        }
        
        var uy = this.suy + duy;
        if( uy < 0 ) {
            uy = 0;
        }
        if( uy >= (global.Map.unitH - this.size) ) {
            uy = worldHeight - cellSize - 1;
        }

        this.updatePosition(ux, uy);
    });
}

Building.prototype.updatePosition = function(ux, uy) {
    this.ux = ux;
    this.uy = uy;

    this.sux = ux;
    this.suy = uy;

    this.mc.x = global.Map.startX + (this.ux+this.uy)*global.Map.cellUnitX;
    this.mc.y = global.Map.startY + (-this.ux+this.uy)*global.Map.cellUnitY;
};


function House(data) {
    Building.call(this);

    this.level = 1;
    this.timer = 0;

    this.size = 6;
    this.mc = new MovieClip("house");
    var basePic = resourceManager.get("base/base"+this.size+".png", "image").data;
    this.mc.addChild( new Texture(basePic, 0, 0, basePic.width, basePic.height, 
                    -Math.round(basePic.width/2), -Math.round(basePic.height/2), basePic.width, basePic.height));

    this.updatePosition(data.ux, data.uy);
}

House.prototype = Building.prototype;
House.prototype.levelUp = function() {
    
};
House.prototype.harvest = function() {
};
