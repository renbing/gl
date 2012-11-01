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
            resourceManager.add(global.assets[i], "txt");
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
}

function prepareUI() {

    var ui = new MovieClip("ui");

    var hud = new MovieClip("hud");
    var bottom = new MovieClip("bottom");
    bottom.y = global.GAME_HEIGHT - 128;

    ui.addChild(hud);
    ui.addChild(bottom);

    global.stage.addChild(ui);
}

function prepareMap() {
    var map = new MovieClip("map");

    var bg = resourceManager.get("bg.jpg").data;
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
        var buildings = [House, Mine, Bank, Silo];
        var building = new buildings[Math.round(Math.random()*10)%buildings.length]({ux:0, uy:0});
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
