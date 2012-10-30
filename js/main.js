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

    resourceManager.add("bg.jpg", "image");

    var baseSizes = [1,4,6,8,10,12];
    for(var i=0; i<baseSizes.length; i++ ) {
        var baseSize = baseSizes[i];
        resourceManager.add("base/base"+baseSize+".png", "image");
        resourceManager.add("base/base_broken"+baseSize+".png", "image");
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

    global.stage.addChild(map);
}

function prepareWindow() {
}
