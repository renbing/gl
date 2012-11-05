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
    gold        : 2500,
    elixir      : 2500,
    cash        : 100,
    worker      : 2,
    working     : 0,
    elixirmax   : 0,
    goldmax     : 0,
    townhall    : 0,
};

User.map = {
    1010 : {id:'gold_mine',     level:1,    state:2,    timer:100},
    1810 : {id:'elixir_pump',   level:1,    state:2,    timer:100},
    3010 : {id:'town_hall',     level:3,    state:0,    timer:0},
    1820 : {id:'gold_storage',  level:1,    state:0,    timer:0},
    1020 : {id:'elixir_storage',level:1,    state:0,    timer:0},
    1830 : {id:'barrack',       level:1,    state:0,    timer:0},
    3030 : {id:'troop_housing', level:1,    state:0,    timer:0},
    4000 : {id:'crashship_1',   state:0},
    4010 : {id:'crater_1',      state:0},
    4020 : {id:'plant_1',       state:0},
    4030 : {id:'rock_1',        state:0},
    4040 : {id:'tree_1',        state:0},
};

User.troops = {
    ground : {
            soldier : 0,
            marine : 0,
        },
    air : {
    }
};

User.mission = {
    1 : [0,0,0], 
};

function Model(data) {
    this.base = data.base;
    this.map = data.map;
    this.troops = data.troops;
    this.mission = data.mission;
    
    this.buildingCount = {};// 地图上的建筑物分类统计
    this.world = {};        // 地图上所有的building对象

    for( var corner in this.map ) {
        var building = this.map[corner];
        if( !this.buildingCount[building.id] ) {
            this.buildingCount[building.id] = 1;
        }else {
            this.buildingCount[building.id] += 1;
        }

        if( building.id == "town_hall" ) {
            this.base.townhall = building.level;
        }
    }
}

Model.prototype.worldAdd = function(building) {
    var corner = building.ux * 100 + building.uy;
    
    this.world[corner] = building;
    this.map[corner] = building.data;
        
    var id = building.data.id;
    if( !this.buildingCount[id] ) {
        this.buildingCount[id] = 1;
    }else{
        this.buildingCount[id] += 1;
    }
}

Model.prototype.worldRemove = function(building) {
    var corner = building.ux * 100 + building.uy;

    delete this.world[corner];
    delete this.map[corner];

    var id = building.data.id;
    if( this.buildingCount[id] && this.buildingCount[id] > 0 ) {
        this.buildingCount[id] -= 1;
    }
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

Model.prototype.updateResourceLimit = function() {
    var goldMax = 0;
    var elixirMax = 0;

    for( var corner in this.map ) {
        var building = this.map[corner];
        var buildingConf = global.csv.building.get(building.id, building.level);
        if( !buildingConf ) continue;
        goldMax += buildingConf.MaxStoredGold;
        elixirMax += buildingConf.MaxStoredElixir;
    }

    this.base.goldmax = goldMax;
    this.base.elixirmax = elixirMax;

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
