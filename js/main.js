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
    mc.x = 100;
    hud.addChild(mc);

    mc = new TextField("0/0");
    mc.x = 150;
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

    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    ui.addChild(hud);
    ui.addChild(bottom);

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
        var buildingIds = ["mine", "house", "bank", "silo"];
        var building = new ResourceBuilding(buildingIds[Math.round(Math.random()*10)%buildingIds.length], {ux:0, uy:0});
        building.mc.addEventListener(Event.MOUSE_CLICK, function(e){
            this.level += 1;
            this.update();
            e.stopPropagation();
        }.bind(building));
        world.addChild(building.mc);
    });

    global.stage.addChild(map);
}

function prepareWindow() {
}

function initGame() {
    global.model = User;
    var hud = global.stage.getChildByName("ui").getChildByName("hud");
    global.model.updateHud = function(name, value) {
        global.model.base[name] += value;
        if( name == "coin" ) {
            hud.getChildAt(3).text = "shit";
        }
    };
}
