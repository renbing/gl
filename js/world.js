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


function Building(corner, data) {
    this.data = data;

    this.ux = Math.floor(corner/100);
    this.uy = corner%100;

    this.sux = this.ux;
    this.suy = this.uy;


    this.dx = 0;
    this.dy = 0;

    var buildingConf = global.csv.building.get(this.data.id, 1);
    this.name = buildingConf.Name;
    this.size = buildingConf.Width;

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
        this.dx = 0;
        this.dy = 0;

        global.map.clearRect(this.sux, this.suy, this.size, this.size);
        if( global.map.testRect(this.ux, this.uy, this.size, this.size) ) {
            this.ux = this.sux;
            this.uy = this.suy;
        }else{
            this.sux = this.ux;
            this.suy = this.uy;
        }
        global.map.addRect(this.ux, this.uy, this.size, this.size);
        this.updatePosition();
    }.bind(this));

    this.mc.addEventListener(Event.MOUSE_CLICK, function(e) {
        if( global.control.mode == "upgrade" ) {
            this.upgrade();
        }else if( global.control.mode == "harvest" ) {
            this.harvest && this.harvest();
        }else if( global.control.mode == "accelerate" ) {
            this.accelerate();
        }

        this.update();
    }.bind(this));


    /* 更新位置显示
     */
    this.updatePosition = function(){
        this.mc.x = global.Map.startX + (this.ux+this.uy)*global.Map.cellUnitX;
        this.mc.y = global.Map.startY + (-this.ux+this.uy)*global.Map.cellUnitY;

        this.adjustDepth();
    }
    
    /* 调整景深
     */
    this.adjustDepth = function(){
        var world = this.mc.parent;
        world.removeChild(this.mc);

        var mcs = world.getChildren();
        var index = 0;
        for( var i=0; i<mcs.length; i++ ) {
            if( mcs[i].y > this.mc.y ) {
                index = i;
                break;
            }
        }

        if( i == mcs.length ) {
            world.addChild(this.mc);
        }else{
            world.addChildAt(this.mc, index);
        }
    };
    
    /* 升级
     */
    this.upgrade = function() {

        if( this.data.upgrade ) return;
        if( !global.model.canWork() ) return;

        var buildingConf = global.csv.building.get(this.data.id, 1);
        var buildResource = buildingConf.BuildResource;
        buildingConf = global.csv.building.get(this.data.id, this.data.level+1);
        if( !buildingConf ) {
            alert("已经达到最大等级");
            return;
        }

        if( !global.model.updateHud(buildResource, -buildingConf.BuildCost) ) {
            return;
        }
        if( this.data.id != "town_hall" && buildingConf.TownHallLevel > global.model.base.townhall ){
            alert("主建筑等级不够");
            return;
        }

        var now = Math.round(+new Date() / 1000);
        this.data.upgrade = now + buildingConf.BuildTime * 60;
        if( this.data.hasOwnProperty("produce") ) {
            this.data.produce = 0;
        }

        global.model.updateHud("working", 1);

        return true;
    }
    
    /* 升级结束
     */
    this.upgraded = function() {
        // 升级结束,开始生产
        var now = Math.round(+new Date() / 1000);

        this.data.level += 1;
        this.data.upgrade = 0;
        
        if( this.data.hasOwnProperty("produce") ) {
            this.data.produce = now;
        }

        if( this.data.id == "town_hall" ) {
            global.model.base.townhall = this.data.level;
        }

        global.model.updateHud("working", -1);
        global.model.updateResourceLimit();

        this.update();
    }
    
    /* 加速升级
     */
    this.accelerate = function() {
        if( !this.data.upgrade ) return;
        
        global.model.updateHud("cash", -5);
        this.upgraded();
    };


    this.onTick = function() {
        var now = Math.round(+new Date() / 1000);
        if( this.data.upgrade ) {
            if( now < this.data.upgrade) {
                this.mc.getChildByName("tip").getChildAt(0).text = "建造/升级 剩余时间:" + (this.data.upgrade - now);
            }else{
                this.upgraded();
            }
        }else if( this.data.hasOwnProperty("produce") && this.data.produce ) {
                this.mc.getChildByName("tip").getChildAt(0).text = "生产时间:" + (now - this.data.produce);
        }
    }.bind(this);
    
    this.update();
    global.gameSchedule.scheduleFunc(this.onTick, 1);
}

function ResourceBuilding(corner, data) {

    this.size = 6;
    this.mc = new MovieClip("ResourceBuilding_" + data.id);

    Building.call(this, corner, data);
}

ResourceBuilding.prototype.update = function() {
    // 0级建造的时候使用1级素材
    var level = this.data.level > 0 ? this.data.level : 1;
    var buildingConf = global.csv.building.get(this.data.id, level);

    if( !buildingConf ) {
        return;
    }
    
    this.mc.removeAllChild();

    var basePic = resourceManager.get("image/base" + this.size+".png");
    this.mc.addChild( new Texture(basePic, 0, 0, basePic.width, basePic.height, 
                    -Math.round(basePic.width/2), -Math.round(basePic.height/2), basePic.width, basePic.height));
    
    var buildingPic = resourceManager.get("image/" + this.data.id + "_" + buildingConf.Asset + ".png");
    var offset = 20;
    if( this.data.id == "wall" ) {
        offset = 0;
    }
    this.mc.addChild( new Texture(buildingPic, 0, 0, buildingPic.width, buildingPic.height, 
                    -Math.round(buildingPic.width/2), -Math.round(buildingPic.height-basePic.height/2+offset), buildingPic.width, buildingPic.height));
    
    var tip = new MovieClip("tip");
    tip.x = -50;
    tip.y = -Math.round(buildingPic.height-basePic.height/2);
    tip.addChild(new TextField("", "", "", 100, 30));
    this.mc.addChild(tip);
};

ResourceBuilding.prototype.harvest = function() {
    if( !this.data.produce ) return;

    if( this.data.hasOwnProperty("produce") ) {
        var buildingConf = global.csv.building.get(this.data.id, this.data.level);
        
        var now = Math.round(+new Date() / 1000);
        var produceSeconds = now - this.data.produce;
        var output = Math.round(buildingConf.ResourcePerHour * produceSeconds / 3600);
        if( output > buildingConf.ResourceMax ) {
            output = +buildingConf.ResourceMax;
        }

        buildingConf = global.csv.building.get(this.data.id, 1);
        if( !global.model.updateHud(buildingConf.ProducesResource, output) ) return;

        this.data.produce = now;
        if( this.data.id == "gold_mine" ) {
            global.soundManager.playEffect("coins_collect_01.wav");
        }else if( this.data.id == "elixir_pump" ) {
            global.soundManager.playEffect("elixir_collect_02.wav");
        }
    }
};

function DefenceBuilding(corner, data) {

    this.mc = new MovieClip("DefenceBuilding_" + this.data.id);

    Building.call(this, corner, data);
}

DefenceBuilding.prototype.update = function() {
    // 0级建造的时候使用1级素材
    var level = this.data.level > 0 ? this.data.level : 1;
    var buildingConf = global.csv.building.get(this.data.id, level);

    if( !buildingConf ) {
        return;
    }
    
    this.mc.removeAllChild();

    var basePic = resourceManager.get("image/base" + this.size+".png");
    this.mc.addChild( new Texture(basePic, 0, 0, basePic.width, basePic.height, 
                    -Math.round(basePic.width/2), -Math.round(basePic.height/2), basePic.width, basePic.height));
    
    var buildingPic = resourceManager.get("image/" + this.data.id + "_" + buildingConf.Asset + ".png");
    this.mc.addChild( new Texture(buildingPic, 0, 0, buildingPic.width, buildingPic.height, 
                    -Math.round(buildingPic.width/2), -Math.round(buildingPic.height-basePic.height/2+20), buildingPic.width, buildingPic.height));
    
    var tip = new MovieClip("tip");
    tip.x = -50;
    tip.y = -Math.round(buildingPic.height-basePic.height/2);
    tip.addChild(new TextField("", "", "", 100, 30));
    this.mc.addChild(tip);
};
