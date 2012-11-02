/**
 * Created by renbing
 * User: renbing
 * Date: 12-10-30
 * Time: 上午11:28
 *
 */


var resourceManager = new ResourceManager();

function main() {
    gameStage.init();
    trace("start game");

    loadLoading();
}

function loadLoading() {
    var loading = new MovieClip("loading");
    global.stage.addChild(loading);

    for(var i=0; i<global.assets.length; i++) {
        var assetName = global.assets[i];
        var assetNameSegs = assetName.split(".");
        var assetFileType = assetNameSegs[assetNameSegs.length - 1];

        if( assetFileType == "png" || assetFileType == "jpg" ) {
            resourceManager.add(global.assets[i], "image");
        }else if( assetFileType == "csv" ) {
            resourceManager.add(global.assets[i], "csv");
        }
    }

    resourceManager.load(start);
}

function start() {
    trace("resource loaded, prepare to start game");
    global.stage.removeChild(global.stage.getChildByName("loading"));

    initConf();

    prepareMap();

    prepareUI();

    prepareWindow();

    initGame();
}

function prepareUI() {

    var ui = new MovieClip("ui");

    var hud = new MovieClip("hud");
    var mc = new TextField("等级:");
    hud.addChild(mc);

    mc = new TextField("1 0/0");
    mc.x = 50
    hud.addChild(mc);

    mc = new TextField("金币:");
    mc.x = 130;
    hud.addChild(mc);

    mc = new TextField("0/0");
    mc.x = 165;
    hud.addChild(mc);

    mc = new TextField("矿石:");
    mc.x = 200;
    hud.addChild(mc);

    mc = new TextField("0/0");
    mc.x = 250;
    hud.addChild(mc);

    mc = new TextField("工人:");
    mc.x = 300;
    hud.addChild(mc);

    mc = new TextField("0/2");
    mc.x = 350;
    hud.addChild(mc);

    mc = new TextField("宝石:");
    mc.x = 400;
    hud.addChild(mc);

    mc = new TextField("300");
    mc.x = 450;
    hud.addChild(mc);

    mc = new TextField("荣誉:");
    mc.x = 500;
    hud.addChild(mc);

    mc = new TextField("300");
    mc.x = 550;
    hud.addChild(mc);

    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    var left = new MovieClip("left");
    left.y = 100;

    var buttons = [ ["nothing","无功能"],   ["accelerate","加速"],
                    ["upgrade","升级建筑"], ["harvest","收取资源"],
                    ["c_house","建造民居"],  ["c_mine","建造矿井"],
                    ["c_bank","建造银行"],   ["c_silo","建造矿仓"],
                    ["c_barrack","建造兵营"],["c_hangar","建造传送门"],
                ];
    
    for(var i=0; i<buttons.length; i++) {
        
        var button = buttons[i];
        mc = new MovieClip(button[0]);
        mc.addChild(new FillRect(0, 0, 100, 30, global.Color.BLACK), 0);
        mc.addChild(new TextField(button[1], "16px sans-serif", global.Color.WHITE, 100, 30, 'center'));
        mc.addEventListener(Event.MOUSE_CLICK, function(e) {
            var childs = left.getChildren();
            for( var j=0; j<childs.length;j++ ) {
                var child = childs[j];
                if( child.name == this.name ) {
                    child.getChildAt(0).color = global.Color.RED;
                }else{
                    child.getChildAt(0).color = global.Color.BLACK;
                }
            }
            global.control.mode = this.name;
        });
        mc.y = i*50;
        left.addChild(mc);
    }

    ui.addChild(hud);
    ui.addChild(bottom);
    ui.addChild(left);

    global.stage.addChild(ui);
    
}

function prepareMap() {
    var map = new MovieClip("map");

    var bg = resourceManager.get("bg.jpg");
    map.addChild(new Texture(bg));

    map.addEventListener(Event.GESTURE_DRAG, function(e) {
        map.x += e.data.x;
        map.y += e.data.y;

        if( map.x > 0 ) {
            map.x = 0;
        }
        if( map.x < (global.GAME_WIDTH - bg.width) ) {
            map.x = global.GAME_WIDTH - bg.width;
        }

        if( map.y > 0 ) {
            map.y = 0;
        }
        if( map.y < (global.GAME_HEIGHT - bg.height) ) {
            map.y = global.GAME_HEIGHT - bg.height;
        }
    });

    var world = new MovieClip("world");
    map.addChild(world);

    map.addEventListener(Event.MOUSE_CLICK, function(e) {
        if( global.control.mode.substr(0,2) == "c_" ) {
            var data = new Object();
            data.id = global.control.mode.split("_")[1];
            data.level = 0;
            data.upgrade = 0;
            data.timer = 0;
            data.stored = 0;

            var building = new ResourceBuilding(0, data);
            building.upgrade();
            world.addChild(building.mc);

            global.model.updateHud(buildingConf.BuildResource, -buildingConf.BuildCost);
        }
    });

    global.stage.addChild(map);
}

function prepareWindow() {
}

function initGame() {
    global.model = User;
    global.control = {};
    global.control.mode = "";

    var hud = global.stage.getChildByName("ui").getChildByName("hud");
    global.model.updateHud = function(name, value) {
        if( name == "Gold" ) {
            name = "gold";
        }
        if( name == "Elixir" ) {
            name = "mine";
        }
        var newValue = global.model.base[name] + value;

        if( name == "xp" ) {
            var oldLevel = global.csv.level.getLevel(global.model.base.xp);
            var newLevel = global.csv.level.getLevel(newValue);
            var nextLevelXp = global.csv.level.getXp(newLevel+1);

            hud.getChildAt(1).text = newLevel + " " + newValue + "/" + nextLevelXp;
        }else if( name == "gold" ) {
            hud.getChildAt(3).text = newValue;
        }else if( name == "mine" ) {
            hud.getChildAt(5).text = newValue;
        }else if( name == "working" ) {
            hud.getChildAt(7).text = newValue + "/" + global.model.base.worker;
        }else if( name == "cash" ) {
            hud.getChildAt(9).text = newValue;
        }else if( name == "score" ) {
            hud.getChildAt(11).text = newValue;
        }

        global.model.base[name]  = newValue;
    };

    global.model.updateHud("xp", 0);
    global.model.updateHud("gold", 0);
    global.model.updateHud("mine", 0);
    global.model.updateHud("working", 0);
    global.model.updateHud("cash", 0);
    global.model.updateHud("score", 0);

    var world = global.stage.getChildByName("map").getChildByName("world");

    for( var corner in global.model.map ) {
        var data = global.model.map[corner];
        var building = new ResourceBuilding(corner, data);

        world.addChild(building.mc);
    }
}

function initConf() {
    global.csv = {};
    global.csv.building = new BuildingCSV(resourceManager.get("buildings.csv"));
    global.csv.level = new LevelCSV(resourceManager.get("levels.csv"));
}
