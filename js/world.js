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

var BuildingState = {
    NORMAL  : 0,
    UPGRADE : 1,
    PRODUCE : 2,
    CLEAR   : 3,
    TRAIN   : 4,
    RESEARCH: 5,
}

function Building(corner, data) {
    this.data = data;

    this.ux = Math.floor(corner/100);
    this.uy = corner%100;

    this.sux = this.ux;
    this.suy = this.uy;


    this.dx = 0;
    this.dy = 0;

    this.buildingBaseConf = global.csv.building.get(this.data.id, 1);
    if( !this.buildingBaseConf ) {
        this.buildingBaseConf = global.csv.obstacle.get(this.data.id);
        this.buildingClass = "Obstacle";
    }else {
        this.buildingClass = this.buildingBaseConf.BuildingClass;
    }

    this.name = this.buildingBaseConf.Name;
    this.size = this.buildingBaseConf.Width;
    
    this.mc = new MovieClip(this.buildingClass + "Building_" + this.data.id);

    this.mc.addEventListener(Event.GESTURE_DRAG, this.onDrag.bind(this));
    this.mc.addEventListener(Event.GESTURE_DRAG_END, this.onDragEnd.bind(this));
    this.mc.addEventListener(Event.MOUSE_CLICK, this.onClick.bind(this));

    this.update();
}

Building.prototype.onDrag = function(e) {
    if( this.buildingClass == "Obstacle" ) {
        return;
    }

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
};

Building.prototype.onDragEnd = function(e) {
    if( this.buildingClass == "Obstacle" ) {
        return;
    }

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
};

Building.prototype.onClick = function(e) {
    var now = Math.round(+new Date() / 1000);
    var actions = [];
    if( this.data.state == BuildingState.UPGRADE ) {
        actions.push([UI.BuildingActionType.CANCEL]);
        actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
    }
    else if( this.data.state == BuildingState.CLEAR ) {
        actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
    }
    else if( this.data.state == BuildingState.RESEARCH ) {
        actions.push([UI.BuildingActionType.CANCEL]);
        actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
    }
    else if( this.data.state == BuildingState.PRODUCE ) {
        if( (now - this.data.timer) < 30 ) {
            var upgradeCost = this.getUpgradeCost();
            upgradeCost && actions.push([UI.BuildingActionType.UPGRADE, upgradeCost]);
        }else {
            // 收取资源
            this.harvest();
            return;
        }
    }
    else if( this.data.state == BuildingState.NORMAL || this.data.state == BuildingState.TRAIN ) {
        if( this.buildingClass == "Obstacle" ) {
            actions.push([UI.BuildingActionType.CLEAR, {resource:this.buildingBaseConf.ClearResource, num:this.buildingBaseConf.ClearCost}]);
        }else {
            var upgradeCost = this.getUpgradeCost();
            upgradeCost && actions.push([UI.BuildingActionType.UPGRADE, upgradeCost]);
            if( this.buildingClass == "Army" ) {
                actions.push([UI.BuildingActionType.TRAIN]);
            }else if( this.buildingClass == "Laboratory" ) {
                actions.push([UI.BuildingActionType.RESEARCH]);
            }
        }
    }

    if( actions.length > 0 ) {
        global.windows.building_action.update(actions, this);
        global.windows.building_action.show();
    }
};

/* 更新位置显示
 */
Building.prototype.updatePosition = function(){
    this.mc.x = global.Map.startX + (this.ux+this.uy)*global.Map.cellUnitX;
    this.mc.y = global.Map.startY + (-this.ux+this.uy)*global.Map.cellUnitY;

    this.adjustDepth();
};

/* 调整景深
 */
Building.prototype.adjustDepth = function(){
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

/* 获取升级需要的资源
 */
Building.prototype.getUpgradeCost = function() {
    var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level+1);
    if( !buildingLevelConf ) {
        alert("已经达到最大等级");
        return;
    }

    return {resource:this.buildingBaseConf.BuildResource, num:buildingLevelConf.BuildCost};
};

/* 升级
 */
Building.prototype.upgrade = function() {
    if( this.buildingClass == "Obstacle" ) return;

    if( this.data.state == BuildingState.UPGRADE ) return;
    if( !global.model.canWork() ) return;

    var upgradeCost = this.getUpgradeCost();
    if( !upgradeCost ) return;

    var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level+1);
    if( this.data.id != "town_hall" && buildingLevelConf.TownHallLevel > global.model.buildingMaxLevel.townhall ){
        alert("主建筑等级不够");
        return;
    }

    if( !global.model.updateHud(upgradeCost.resource, -upgradeCost.num) ) {
        return;
    }

    var now = Math.round(+new Date() / 1000);
    this.data.timer = now + buildingLevelConf.BuildTime * 60;
    this.data.state = BuildingState.UPGRADE;

    global.model.updateHud("working", 1);

    return true;
}

/* 升级结束
 */
Building.prototype.upgraded = function() {
    if( this.buildingClass == "Obstacle" ) return;

    // 升级结束,开始生产
    var now = Math.round(+new Date() / 1000);

    this.data.level += 1;
    this.data.state = BuildingState.NORMAL;
    
    if( this.buildingBaseConf.BuildingClass == "Resource" ) {
        this.data.state = BuildingState.PRODUCE;
        this.data.timer = now;
    }else if( this.buildingBaseConf.BuildingClass == "Army" ) {
        this.training();
    }

    global.model.updateHud("working", -1);
    global.model.updateBuildingStatistic();

    this.update();
};

/* 加速升级,清理,研究等
 */
Building.prototype.accelerate = function() {
    if( this.data.state == BuildingState.UPGRADE ) {
        if( !global.model.updateHud("cash", -5) ) return;
        this.upgraded();
    }else if( this.data.state == BuildingState.CLEAR ) {
        if( !global.model.updateHud("cash", -5) ) return;
        this.deleted();
    }else if( this.data.state == BuildingState.RESEARCH ) {
        if( !global.model.updateHud("cash", -5) ) return;
        this.researched();    
    }else if( this.data.state == BuildingState.TRAIN ) {
        if( !global.model.updateHud("cash", -5) ) return;

        var task = this.data.task;
        for( var i=0; i<task.length; i++ ) {
            var character = task[i][0];
            var num = task[i][1];
            if( !global.model.troops[character] ) {
                global.model.troops[character] = num;
            }else {
                global.model.troops[character] += num;
            }
        }

        this.data.state = BuildingState.NORMAL;
        this.data.task = [];
    }
};

/* 删除
 */
Building.prototype.deleted = function() {
    if( this.data.id == "town_hall" ) {
        alert("指挥中心不能删除");
        return;
    }

    if( this.data.state == BuildingState.CLEAR || this.data.state == BuildingState.UPGRADE ) {
        global.model.updateHud("working", -1);
    }
    global.model.worldRemove(this);
    this.mc.removeFromParent();
};

/* 更新显示
 */
Building.prototype.update = function() {
    this.mc.removeAllChild();
    
    var basePic;
    var offset = 0;
    if( this.buildingClass != "Obstacle" && this.buildingClass != "Wall" && this.buildingClass != "Defence" ) {
        basePic = resourceManager.get("image/base" + this.size+".png");
        this.mc.addChild( new Texture(basePic, 0, 0, basePic.width, basePic.height, 
                        -Math.round(basePic.width/2), -Math.round(basePic.height/2), basePic.width, basePic.height));
        offset = -basePic.height/2 + 20;

    }
    
    var tipy = 0;
    if( this.buildingClass == "Obstacle" ) {
        var obstaclePic = resourceManager.get("obstacle/deco_" + this.data.id + ".png");
        this.mc.addChild( new Texture(obstaclePic, 0, 0, obstaclePic.width, obstaclePic.height, 
                        -Math.round(obstaclePic.width/2), -Math.round(obstaclePic.height/2), obstaclePic.width, obstaclePic.height));
        tipy = -Math.round(obstaclePic.height/2);
    }else {
        // 0级建造的时候使用1级素材
        var level = this.data.level > 0 ? this.data.level : 1;
        var buildingLevelConf = global.csv.building.get(this.data.id, level);

        if( !buildingLevelConf ) {
            return;
        }

        var buildingPic = resourceManager.get("image/" + this.data.id + "_" + buildingLevelConf.Asset + ".png");
        this.mc.addChild( new Texture(buildingPic, 0, 0, buildingPic.width, buildingPic.height, 
                        -Math.round(buildingPic.width/2), -Math.round(buildingPic.height+offset), buildingPic.width, buildingPic.height));
        
        tipy = -Math.round(buildingPic.height + offset);
    }
    
    var tip = new MovieClip("tip");
    tip.x = -50;
    tip.y = tipy;
    tip.addChild(new TextField("", "", "", 100, 30));
    this.mc.addChild(tip);
}

/* 每秒钟的状态更新
 */
Building.prototype.onTick = function() {
    var now = Math.round(+new Date() / 1000);
    var tip = this.mc.getChildByName("tip");
    tip.visible = true;

    if( this.data.state == BuildingState.UPGRADE ) {
        if( now < this.data.timer ) {
            tip.getChildAt(0).text = "建造/升级 剩余时间:" + (this.data.timer - now);
        }else{
            this.upgraded();
            tip.visible = false;
        }
    }else if( this.data.state == BuildingState.PRODUCE ) {
            tip.getChildAt(0).text = "生产时间:" + (now - this.data.timer);
    }else if( this.data.state == BuildingState.CLEAR ) {
        if( now < this.data.timer ) {
            tip.getChildAt(0).text = "清理 剩余时间:" + (this.data.timer - now);
        }else{
            this.deleted();
        }
    }else if( this.data.state == BuildingState.TRAIN ) {
        if( now < this.data.timer ) {
            tip.getChildAt(0).text = "训练 剩余时间:" + (this.data.timer - now);
        }else{
            tip.visible = this.trained();
        }
    }else if( this.data.state == BuildingState.RESEARCH ) {
        if( now < this.data.timer ) {
            tip.getChildAt(0).text = "研究 剩余时间:" + (this.data.timer - now);
        }else{
            this.researched();
            tip.visible = false;
        }
    }else{
        tip.visible = false;
    }
};

Building.prototype.harvest = function() {
    if( this.data.state != BuildingState.PRODUCE ) return;

    var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level);
    
    var now = Math.round(+new Date() / 1000);
    var produceSeconds = now - this.data.timer;
    var output = Math.round(buildingLevelConf.ResourcePerHour * produceSeconds / 3600);
    if( output > buildingLevelConf.ResourceMax ) {
        output = +buildingLevelConf.ResourceMax;
    }

    if( !global.model.updateHud(this.buildingBaseConf.ProducesResource, output) ) return;

    this.data.timer = now;
    if( this.data.id == "gold_mine" ) {
        global.soundManager.playEffect("coins_collect_01.wav");
    }else if( this.data.id == "elixir_pump" ) {
        global.soundManager.playEffect("elixir_collect_02.wav");
    }
};

Building.prototype.clear = function() {
    if( this.buildingClass != "Obstacle" ) return;

    var now = Math.round(+new Date() / 1000);
    if( !global.model.updateHud(this.buildingBaseConf.ClearResource, -this.buildingBaseConf.ClearCost) ) return;

    this.data.state = BuildingState.CLEAR;
    this.data.timer = now + this.buildingBaseConf.ClearTimeSeconds;

    global.model.updateHud("working", 1);
};

Building.prototype.cancel = function() {
    var now = Math.round(+new Date() / 1000);

    if( this.data.state == BuildingState.UPGRADE ) {
        this.data.state = BuildingState.NORMAL;
        if( this.buildingClass == "Resource" ) {
            this.data.state = BuildingState.PRODUCE;
            this.data.timer = now;
        }
        global.model.updateHud("working", -1);
    }else if( this.data.state == BuildingState.RESEARCH ) {
        this.data.state = BuildingState.NORMAL;
        this.data.timer = 0;
    }
};

Building.prototype.research = function(character) {
    if( this.data.id != "laboratory" ) return;
    if( this.data.state != BuildingState.NORMAL ) return;

    var now = Math.round(+new Date() / 1000);

    var level = global.model.laboratory[character];
    if( !level ) {
        global.model.laboratory[character] = 1;
        level = 1;
    }

    var characterLevelConf = global.csv.character.get(character, level + 1);
    if( !characterLevelConf ) {
        alert("无法升级,以及达到顶级");
        return;
    }

    var characterBaseConf = global.csv.character.get(character, 1);
    if( !global.model.updateHud(characterBaseConf.UpgradeResource, -characterLevelConf.UpgradeCost) ) {
        return;
    }

    this.data.state = BuildingState.RESEARCH;
    this.data.timer = now + characterLevelConf.UpgradeTimeH * 3600;
    this.data.research = character;
};

Building.prototype.researched = function() {
    if( this.data.id != "laboratory" ) return;
    if( this.data.state != BuildingState.RESEARCH ) return;

    global.model.laboratory[this.data.research] += 1;
    this.data.state = BuildingState.NORMAL;
    this.data.timer = 0;
};

Building.prototype.train = function(character, num) {
    if( this.data.state == BuildingState.UPGRADE ) return;
    if( Math.abs(num) > 1 ) return;

    var task = this.data.task;
    var taskIndex = -1;
    for( var i=0; i<task.length; i++ ) {
        if( task[i][0] == character ) {
            taskIndex = i;
            break;
        }
    }
    
    // 没有可以取消的训练
    if( taskIndex < 0 && num < 0 ) return;

    // 判断当前建筑训练限制
    if( num > 0 ) {
        var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level);
        if( 0 >= buildingLevelConf.UnitProduction ) return;
    }

    var characterBaseConf = global.csv.character.get(character, 1);
    var characterLevel = global.model.laboratory[character];
    var characterLevelConf = global.csv.character.get(character, characterLevel);

    if( !global.model.updateHud(characterBaseConf.TrainingResource, -characterLevelConf.TrainingCost*num) ) return;
    
    if( taskIndex < 0 ) {
        task.push([character, num]);
    }else {
        task[taskIndex][1] += num;
        if( task[taskIndex][1] == 0 ) {
            task.splice(taskIndex, 1);
            if( this.data.state == BuildingState.TRAIN && this.data.train == character ) {
                // 取消正在训练的,且没有更多可以训练的
                this.data.state = BuildingState.NORMAL;
            }
        }
    }

    this.training();
};

Building.prototype.training = function(character) {
    if( this.data.state == BuildingState.TRAIN ) return;

    if( this.data.task.length == 0 ) {
        this.data.state = BuildingState.NORMAL;
        this.data.timer = 0;
    }else {
        var character = this.data.task[0][0];
        var level = global.model.laboratory[character] ? global.model.laboratory[character] : 1;
        var characterLevelConf = global.csv.character.get(character, level);

        var now = Math.round(+new Date() / 1000);
        this.data.state = BuildingState.TRAIN;
        this.data.timer = now + characterLevelConf.TrainingTime;
        this.data.train = character;
    }
};

Building.prototype.trained = function() {
    if( global.model.houseSpace >= global.model.base.troopmax ) {
        trace("没有更多的人口空间");
        return;
    }

    var character = this.data.train;
    var emptyIndex = -1;
    var task = this.data.task;
    for( var i=0; i<task.length; i++ ) {
        if( task[i][0] == character ) {
            task[i][1] -= 1;
            if( task[i][1] == 0 ) {
                emptyIndex = i;
            }
            break;
        }
    }

    if( emptyIndex >= 0 ) {
        task.splice(emptyIndex, 1);
    }

    var characterBaseConf = global.csv.character.get(character, 1);
    global.model.houseSpace += characterBaseConf.HousingSpace;
    if( !global.model.troops[character] ) {
        global.model.troops[character] = 1;
    }else {
        global.model.troops[character] += 1;
    }

    this.data.state = BuildingState.NORMAL;
    this.training();
};
