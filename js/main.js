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

    for(var i=0; i<global.Assets.length; i++) {
        var assetName = global.Assets[i];
        var assetNameSegs = assetName.split(".");
        var assetFileType = assetNameSegs[assetNameSegs.length - 1];

        if( assetFileType == "png" || assetFileType == "jpg" ) {
            resourceManager.add(global.Assets[i], "image");
        }else if( assetFileType == "csv" ) {
            resourceManager.add(global.Assets[i], "csv");
        }
    }

    for( var id in global.Animations ) {
        var clip = global.Animations[id];
        for(var action in clip ) {
            var frames = clip[action][0];
            for( var i=1; i<=frames; i++ ) {
                resourceManager.add("animations/" + id + "/" + action + "/" + action + "_" + i + ".png", "image");
            }
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
    ui.addChild(new FillRect(0, 0, global.GAME_WIDTH, 30, global.Color.BLACK));

    var hud = new MovieClip("hud");
    var hudItems = ["等级:","金币:","石油:","工人:","宝石:","荣誉:"];
    for( var i=0; i<hudItems.length; i++ ) {
        var mc = new TextField(hudItems[i],"","",100,30,"right");
        mc.x = i*2 * 100;
        hud.addChild(mc);
        mc = new TextField("","","",100,30,"left");
        mc.x = (i*2+1) * 100;
        hud.addChild(mc);
    }

    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    var left = new MovieClip("left");
    left.y = 50;

    var buttons = [ ["nothing","无功能"],
                    ["c_gold_mine","建造金矿"],  ["c_elixir_pump","建造油井"],
                    ["c_gold_storage","建造金库"],  ["c_elixir_storage","建造油库"],
                    ["c_barrack","建造兵营"],["c_troop_housing","建造传送门"],
                    ["c_laboratory","建造实验室"],["c_cannon","建造加能炮"],
                    ["c_archer_tower","建造激光塔"],["c_wall","建造围墙"],
                    ["c_wizard_tower","建造重炮塔"],["c_air_defense","建造防空导弹"],
                    ["c_mortar","建造核弹塔"], ["marine", "放一个测试兵"],
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
        mc.y = Math.floor(i/2)*40;
        mc.x = (i%2)*120;
        left.addChild(mc);
    }

    ui.addChild(hud);
    ui.addChild(bottom);
    ui.addChild(left);

    global.stage.addChild(ui);
    
}

function prepareMap() {
    var map = new MovieClip("map");
    map.x = -216;
    map.y = -844;

    var bg = resourceManager.get("image/bg.jpg");
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
        var dx = e.data.x - this.x - global.Map.startX;
        var dy = e.data.y - this.y - global.Map.startY;

        var fdux = (dx - 2 * dy) / 4 / global.Map.cellUnit;
        var fduy = (dx + 2 * dy) / 4 / global.Map.cellUnit;

        var dux = (fdux > 0 ? 1:-1) * Math.floor(Math.abs(fdux));
        var duy = (fduy > 0 ? 1:-1) * Math.floor(Math.abs(fduy));
        if( dux < 0 || duy < 0 ) {
            return;
        }
        var corner = dux * 100 + duy;

        if( global.control.mode.substr(0,2) == "c_" ) {
            if( !global.model.canWork() ) return;
            
            var buildingId = global.control.mode.substr(2, global.control.mode.length-2);
            var buildingConf = global.csv.building.get(buildingId, 1);

            var data = new Object();
            data.id = buildingId;
            data.level = 0;
            data.state = BuildingState.NORMAL;
            data.timer = 0;
            
            if( buildingId == "barrack" || buildingId == "machine" || buildingId == "shipyard" ) {
                data.task = [];
                data.train = "";
            }else if( buildingId == "laboratory" ) {
                data.research = "";
            }

            
            var maxBuild = global.csv.townhall.get(global.model.buildingMaxLevel.town_hall)[buildingConf.Name];
            if( global.model.buildingCount[data.id] >= maxBuild ) {
                alert("超出该建筑建造限制:"+maxBuild);
                return;
            }
            
            var building = new Building(corner, data);
            if( global.map.testRect(building.ux, building.uy, building.size, building.size) ) {
                alert("无法建在该地方,已经存在建筑");
                return;
            }

            if( building.upgrade() ) {
                world.addChild(building.mc);
                building.updatePosition();
                global.model.worldAdd(building);
                global.map.addRect(building.ux, building.uy, building.size, building.size);
                global.graph.update(building.ux, building.uy, building.size, building.size, GraphNodeType.WALL);
            }
        }else if( global.control.mode == "marine" ) {
            global.soldier.mc.x = e.data.x - this.x - 25; 
            global.soldier.mc.y = e.data.y - this.y - 25;
            global.soldier.corner = corner;
            global.soldier.mc.visible = true;
        }else if( global.control.mode == "nothing" ) {
            var sux = Math.floor(global.soldier.corner / 100);
            var suy = global.soldier.corner % 100;

            var path = astar.search(global.graph.nodes, global.graph.nodes[sux][suy], global.graph.nodes[dux][duy]);
            if( path.length > 0 ) {
                global.soldierLine.line = [global.soldier.corner];
                global.soldierLine.pos = 0;
                for( var i=0; i<path.length; i++ ) {
                    global.soldierLine.line.push(path[i].pos.x * 100 + path[i].pos.y);
                }
                global.soldierLine.moved = null;
            }
        }
    });

    global.stage.addChild(map);
}

function prepareWindow() {
}

function initGame() {
    global.model = new Model(User);

    global.control = {};
    global.control.mode = "nothing";

    global.map = new LogicMap(global.Map.unitW, global.Map.unitH);
    global.graph = new Graph(global.Map.unitW, global.Map.unitH);
    global.soldier = {mc : (new SoldierAnimation("marine")).animations.running_0, corner: 0};
    global.soldierLine = {line:[], pos:0};


    global.stage.getChildByName("map").addChild(global.soldier.mc);

    global.model.updateHud("xp", 0);
    global.model.updateHud("gold", 0);
    global.model.updateHud("elixir", 0);
    global.model.updateHud("working", 0);
    global.model.updateHud("cash", 0);
    global.model.updateHud("score", 0);

    var world = global.stage.getChildByName("map").getChildByName("world");
    for( var corner in global.model.map ) {
        var data = global.model.map[corner];

        var building = new Building(corner, data);

        world.addChild(building.mc);
        building.updatePosition();
        
        global.model.worldAdd(building);
        global.map.addRect(building.ux, building.uy, building.size, building.size);
        global.graph.update(building.ux, building.uy, building.size, building.size, GraphNodeType.WALL);
    }
    
    // world地图更新
    global.gameSchedule.scheduleFunc(function(){
        var now = Math.round(+new Date() / 1000);

        for(var corner in global.model.world ) {
            global.model.world[corner].onTick();
        }

        for( var character in global.model.laboratory ) {
            var data = global.model.laboratory[character];
            if( data.timer > 0 && now >= data.timer ) {
                data.level += 1;
                data.timer = 0;
            }
        }
    }, 1);

    var bgMusic = new Sound("home_music.mp3");
    //global.soundManager.playBackground(bgMusic);
    
    // 全局按钮
    global.button = {};
    global.button.onClick = function(buttonName) {
    };

    global.windows = {};
    global.windows.test = new UI.TestWindow({"test":"测试"});
    global.windows.building_action = new UI.BuildingActionWindow();
    
    var all = {};
    var grounds = {};
    var machines = {};
    var airs = {};

    var groundConfs = global.csv.character.getByBuilding("barrack");
    for(var i=0; i<groundConfs.length; i++ ) {
        var obj = groundConfs[i];
        all[obj.ID] = obj.Name;
        grounds[obj.ID] = obj.Name;
    }
    var machineConfs = global.csv.character.getByBuilding("machine");
    for(var i=0; i<machineConfs.length; i++ ) {
        var obj = machineConfs[i];
        all[obj.ID] = obj.Name;
        machines[obj.ID] = obj.Name;
    }
    var airConfs = global.csv.character.getByBuilding("shipyard");
    for(var i=0; i<airConfs.length; i++ ) {
        var obj = airConfs[i];
        all[obj.ID] = obj.Name;
        airs[obj.ID] = obj.Name;
    }

    global.windows.character = {
        barrack : new UI.CharacterWindow(grounds, "train"),
        machine : new UI.CharacterWindow(machines, "train"),
        shipyard : new UI.CharacterWindow(airs, "train"),
        laboratory : new UI.CharacterWindow(all, "research"),
    };

    global.stage.addEventListener(Event.ENTER_FRAME, function(e) {
        if( global.soldierLine.line.length <= 0 ) return;
        
        if( !global.soldierLine.moved || global.soldierLine.moved >= 10 ) {
            if( global.soldierLine.moved ) {
                global.soldierLine.pos += 1;
            }

            global.soldier.corner = global.soldierLine.line[global.soldierLine.pos];

            if( global.soldierLine.pos >= global.soldierLine.line.length-1 ) {
                global.soldierLine.line = [];
                return;
            }

            var sCorner = global.soldierLine.line[global.soldierLine.pos];
            var dCorner = global.soldierLine.line[global.soldierLine.pos+1];

            var dux = Math.floor(dCorner/100) - Math.floor(sCorner/100);
            var duy = dCorner%100 - sCorner%100;
            
            var directionX = 0;
            var directionY = 0;

            if( dux != 0 ) {
                directionX = dux/Math.abs(dux);
                directionY = -dux/Math.abs(dux);
            }else {
                directionX = duy/Math.abs(duy);
                directionY = duy/Math.abs(duy);
            }

            global.soldierLine.moved = 0;
            global.soldierLine.direction = {x:directionX, y:directionY};
        }

        global.soldierLine.moved += 1;

        global.soldier.mc.x += 1/10 * global.soldierLine.direction.x * global.Map.cellUnitX;
        global.soldier.mc.y += 1/10 * global.soldierLine.direction.y * global.Map.cellUnitY;
        
    });
}

function initConf() {
    global.csv = {};
    global.csv.building = new BuildingCSV(resourceManager.get("csv/buildings.csv"));
    global.csv.level = new LevelCSV(resourceManager.get("csv/levels.csv"));
    global.csv.townhall = new TownHallLevelCSV(resourceManager.get("csv/townhall_levels.csv"));
    global.csv.obstacle = new CommonCSV(resourceManager.get("csv/obstacles.csv"));
    global.csv.global = new GlobalCSV(resourceManager.get("csv/globals.csv"));
    global.csv.character = new CharacterCSV(resourceManager.get("csv/characters.csv"));
}
