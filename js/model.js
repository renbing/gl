/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-01
 * Time: 下午2:47
 *
 */

/**
 * 数据模型
 */

var User = {};

User.base = {
    xp          : 100,
    score       : 100,
    gold        : 15000000,
    elixir      : 15000000,
    cash        : 1000000,
    worker      : 2,
    working     : 0,
    elixirmax   : 25000000,
    goldmax     : 25000000,
    troopmax    : 0,
};

User.map = {
    1010 : {id:'gold_mine',     level:1,    state:2,    timer:100},
    1810 : {id:'elixir_pump',   level:1,    state:2,    timer:100},
    3010 : {id:'town_hall',     level:3,    state:0,    timer:0},
    1820 : {id:'gold_storage',  level:1,    state:0,    timer:0},
    1020 : {id:'elixir_storage',level:1,    state:0,    timer:0},
    3025 : {id:'troop_housing', level:1,    state:0,    timer:0},
    1830 : {id:'barrack',       level:1,    state:0,    timer:0,    task:[],    train:""},
    3040 : {id:'machine',       level:1,    state:0,    timer:0,    task:[],    train:""},
    1040 : {id:'shipyard',      level:1,    state:0,    timer:0,    task:[],    train:""},
    2040 : {id:'laboratory',    level:1,    state:0,    timer:0,    research:""},
    4000 : {id:'crashship_1',   state:0},
    4010 : {id:'crater_1',      state:0},
    4020 : {id:'plant_1',       state:0},
    4030 : {id:'rock_1',        state:0},
    4040 : {id:'tree_1',        state:0},
};

// 部队数量
User.troops = {
    marine : 10,
};

// 实验室兵种解锁以及升级等级
User.laboratory = {
    marine : 1,
};

User.mission = {
    1 : [0,0,0], 
};

function Model(data) {
    this.base = data.base;
    this.map = data.map;
    this.troops = data.troops;
    this.laboratory = data.laboratory;
    this.mission = data.mission;
    
    this.buildingCount = {};// 地图上的建筑物分类统计
    this.buildingMaxLevel = {}; // 地图上建筑最大等级
    this.world = {};        // 地图上所有的building对象
    this.houseSpace = 0;
    
    for( var id in this.troops ) {
        var characterBaseConf = global.csv.character.get(id, 1);
        this.houseSpace += this.troops[id] * characterBaseConf.HousingSpace;
    }
}

Model.prototype.worldAdd = function(building) {
    var corner = building.ux * 100 + building.uy;
    
    this.world[corner] = building;
    this.map[corner] = building.data;
    
    this.updateBuildingStatistic();
}

Model.prototype.worldRemove = function(building) {
    var corner = building.ux * 100 + building.uy;

    delete this.world[corner];
    delete this.map[corner];

    this.updateBuildingStatistic();
}

Model.prototype.worldUpdate = function(oldCorner, building) {
    var corner = building.ux * 100 + building.uy;

    delete this.world[oldCorner];
    delete this.map[oldCorner];

    this.world[corner] = building;
    this.map[corner] = building.data;
}

Model.prototype.updateHud = function(name, value) {
    var hud = global.stage.getChildByName("ui").getChildByName("hud");
    name = name.toLowerCase();

    var newValue = this.base[name] + value;
    if( newValue < 0 ) {
        alert(name + "不足:" + (-value));
        return false;
    }

    if( name == "xp" ) {
        var oldLevel = global.csv.level.getLevel(this.base.xp);
        var newLevel = global.csv.level.getLevel(newValue);
        var nextLevelXp = global.csv.level.getXp(newLevel+1);

        hud.getChildAt(1).text = newLevel + " " + newValue + "/" + nextLevelXp;
    }else if( name == "gold" ) {
        if( this.base.gold >= this.base.goldmax && value > 0 ) {
            alert("金币满了");
            return false;
        }
        if( newValue > this.base.goldmax ) {
            newValue = this.base.goldmax;
        }
        hud.getChildAt(3).text = newValue + "/" + this.base.goldmax;
    }else if( name == "elixir" ) {
        if( this.base.elixir >= this.base.elixirmax && value > 0 ) {
            alert("石油满了");
            return false;
        }
        if( newValue > this.base.elixirmax ) {
            newValue = this.base.elixirmax;
        }
        hud.getChildAt(5).text = newValue + "/" + this.base.elixirmax;
    }else if( name == "working" ) {
        hud.getChildAt(7).text = newValue + "/" + this.base.worker;
    }else if( name == "cash" ) {
        hud.getChildAt(9).text = newValue;
    }else if( name == "score" ) {
        hud.getChildAt(11).text = newValue;
    }

    this.base[name]  = newValue;

    return true;
};

Model.prototype.updateBuildingStatistic = function() {
    var goldMax = 0;
    var elixirMax = 0;
    var troopMax = 0;
    
    this.buildingCount = {};
    this.buildingMaxLevel = {};

    for( var corner in this.world ) {
        var building = this.world[corner];
        if( building.buildingClass == "Obstacle" ) continue;

        var id = building.data.id;
        var level = building.data.level;
        if( level <= 0 ) continue;

        var buildingConf = global.csv.building.get(id, level);
        goldMax += buildingConf.MaxStoredGold;
        elixirMax += buildingConf.MaxStoredElixir;
        troopMax += buildingConf.MaxStoredTroop;

        if( !this.buildingCount[id] ) {
            this.buildingCount[id] = 0;
        }
        this.buildingCount[id] = 0;

        if( !this.buildingMaxLevel[id] || this.buildingMaxLevel[id] < level ) {
            this.buildingMaxLevel[id] = level;
        }
    }

    //this.base.goldmax = goldMax;
    //this.base.elixirmax = elixirMax;
    this.base.troopmax = troopMax;

    this.updateHud("gold", 0);
    this.updateHud("elixir", 0);
};

Model.prototype.canWork = function() {
    if( this.base.working >= this.base.worker ) {
        alert("没有更多的工人");
        return false;
    }

    return true;
};
