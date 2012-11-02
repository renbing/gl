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
    this.ux = this.ux || 0;
    this.uy = this.uy || 0;

    this.sux = this.ux;
    this.suy = this.uy;

    this.size = this.size || 1;

    this.dx = 0;
    this.dy = 0;

    this.updatePosition = updatePosition;
    
    if( this.onTouch ) {
        this.mc.addEventListener(Event.MOUSE_CLICK, this.onTouch.bind(this));
    }

    this.mc.addEventListener(Event.GESTURE_DRAG, function(e) {
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
            ux = global.Map.unitW - this.size - 1;
        }
        
        var uy = this.suy + duy;
        if( uy < 0 ) {
            uy = 0;
        }
        if( uy >= (global.Map.unitH - this.size) ) {
            uy = global.Map.unitH - this.size - 1;
        }

        this.ux = ux;
        this.uy = uy;
        this.updatePosition();

    }.bind(this));

    this.mc.addEventListener(Event.GESTURE_DRAG_END, function(e) {
        this.sux = this.ux;
        this.suy = this.uy;
        this.dx = 0;
        this.dy = 0;
    }.bind(this));

    /* 更新位置显示
     */
    function updatePosition(){
        this.mc.x = global.Map.startX + (this.ux+this.uy)*global.Map.cellUnitX;
        this.mc.y = global.Map.startY + (-this.ux+this.uy)*global.Map.cellUnitY;
    };
}

function ResourceBuilding(corner, data) {
    this.data = data;
    this.ux = Math.floor(corner/100);
    this.uy = corner%100;

    this.size = 6;
    this.mc = new MovieClip("ResourceBuilding_" + this.data.id);

    this.onTickFunc = this.onTick.bind(this);

    Building.call(this);
    this.update();
}

ResourceBuilding.prototype.update = function() {
    // 0级建造的时候使用1级素材
    var level = this.data.level > 0 ? this.data.level : 1;
    var buildingConf = global.csv.building.get(this.data.id, level);

    if( !buildingConf ) {
        return;
    }

    this.mc.removeAllChild();

    var basePic = resourceManager.get("base"+this.size+".png");
    this.mc.addChild( new Texture(basePic, 0, 0, basePic.width, basePic.height, 
                    -Math.round(basePic.width/2), -Math.round(basePic.height/2), basePic.width, basePic.height));
    
    var buildingPic = resourceManager.get(this.data.id + "_" + buildingConf.Asset + ".png");
    this.mc.addChild( new Texture(buildingPic, 0, 0, buildingPic.width, buildingPic.height, 
                    -Math.round(buildingPic.width/2), -Math.round(buildingPic.height-basePic.height/2), buildingPic.width, buildingPic.height));
    
    var upgradeMc = new MovieClip("upgrade");
    upgradeMc.x = -50;
    upgradeMc.y = -Math.fround(buildingPic.height-basePic.height/2);
    upgradeMc.addChild(new TextField("", "", "", 100, 30));
    this.mc.addChild(upgradeMc);

    global.gameSchedule.scheduleFunc(this.onTickFunc, 1);
    
    this.updatePosition();
};

ResourceBuilding.prototype.harvest = function() {
    if( this.data.upgrade ) return;

    if( this.data.id == "house" || this.data.id == "mine" ) {
        var buildingConf = global.csv.building.get(this.data.id, this.data.level);

        var now = Math.round(+new Date() / 1000);
        var output = Math.round(buildingConf.ResourcePerHour * (now /3600));
        if( output > buildingConf.ResourceMax ) {
            output = +buildingConf.ResourceMax;
        }
        
        buildingConf = global.csv.building.get(this.data.id, 1);
        global.model.updateHud(buildingConf.ProducesResource, output);

        this.data.timer = now;
    }
};

ResourceBuilding.prototype.upgrade = function() {
    if( this.data.upgrade ) return;

    var buildingConf = global.csv.building.get(this.data.id, 1);
    var buildResource = buildingConf.BuildResource;
    buildingConf = global.csv.building.get(this.data.id, this.data.level+1);
    if( !buildingConf ) return;

    if( buildResource == "Gold" && +buildingConf.BuildCost > global.model.base.gold ) {
        alert("金币不够");
        return;
    }
    if( buildResource == "Elixir" && +buildingConf.BuildCost > global.model.base.mine ) {
        alert("矿石不够");
        return;
    }

    
    global.model.updateHud(buildResource, -buildingConf.BuildCost);

    var now = Math.round(+new Date() / 1000);
    this.data.upgrade = now + buildingConf.BuildTime * 60;
};

ResourceBuilding.prototype.onTouch = function(e) {
    
    if( global.control.mode == "upgrade" ) {
        this.upgrade();
    } else if( global.control.mode == "harvest" ) {
        this.harvest();
    }
    this.update();

    e.stopPropagation();
};

ResourceBuilding.prototype.onTick = function(e) {
    if( !this.upgrade ) return;

    var now = Math.round(+new Date() / 1000);
    if( this.upgrade < now ) {
        this.mc.getChildByName("upgrade").getChildAt(0).text = "升级剩余时间:" + (now - this.upgrade);
    }else{
        this.level += 1;
        this.upgrade = 0;
        this.timer = now;

        this.update();
    }
};
