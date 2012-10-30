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

    var world = new MovieClip("world");
    map.addChild(world);
    
    var worldWidth = 13*6;
    var worldHeight = 12*6;

    var cornerX = 286+117;
    var cornerY = 1342-150;
    var cellSize = 6;
    var cellUnitX = 15.5;
    var cellUnitY = 7.7;

    var logicMap = new LogicMap(worldWidth, worldHeight);
    
    var cellBgData = resourceManager.get("base/base6.png").data;
    /*
    for( var i=0; i<13; i++ ) {
        for( var j=0; j<12; j++) {
            var cell = new MovieClip("cell");
            cell.addChild(new Texture(cellBgData, 0, 0, cellBgData.width, cellBgData.height, 
                        -Math.round(cellBgData.width/2), -Math.round(cellBgData.height/2), cellBgData.width, cellBgData.height));
            cell.x = cornerX + (i+j)*cellUnitX*cellSize;
            cell.y = cornerY + (-i+j)*cellUnitY*cellSize;
            world.addChild(cell);
        }
    }
    */

    map.addEventListener(Event.MOUSE_CLICK, function(e) {
        var cell = new MovieClip("cell");
        cell.addChild(new Texture(cellBgData, 0, 0, cellBgData.width, cellBgData.height, 
                    -Math.round(cellBgData.width/2), -Math.round(cellBgData.height/2), cellBgData.width, cellBgData.height));
        cell.x = cornerX;
        cell.y = cornerY;

        cell.dx = 0;
        cell.dy = 0;

        cell.ux = 0;
        cell.uy = 0;

        map.addChild(cell);
        logicMap.addRect(0, 0, cellSize, cellSize);

        cell.addEventListener(Event.GESTURE_DRAG, function(e) {
            cell.dx += e.data.x;
            cell.dy += e.data.y;

            if( Math.abs(cell.dx) >= cellUnitX ) {
                var units = (cell.dx > 0 ? 1 : -1) * Math.floor(Math.abs(cell.dx) / cellUnitX);
                if( (cell.ux + units) < 0 || (cell.ux + units) > 13) {
                    return;
                }

                var dx = units * cellUnitX;
                var dy = units * cellUnitY;
                cell.x += dx;
                cell.y += dy;
                cell.dx -= dx;

                cell.ux += units;
            }
            if( Math.abs(cell.dy) >= cellUnitY ) {
                var units = (cell.dy > 0 ? 1 : -1 ) * Math.floor(Math.abs(cell.dy) / cellUnitY);
                if( (cell.uy + units) < 0 || (cell.uy + units) > 12 ) {
                    return;
                }

                var dy = units * cellUnitY;
                cell.y += dy;
                cell.dy -= dy;

                cell.uy += units;
            }

            trace(logicMap.testRect(cell.ux, cell.uy, cellSize, cellSize));
            trace(cell.ux + ":" + cell.uy);
        });

        cell.addEventListener(Event.GESTURE_DRAG_END, function(e) {
            cell.dx = 0;
            cell.dy = 0;
        });
    });

    global.stage.addChild(map);
}

function prepareWindow() {
}
