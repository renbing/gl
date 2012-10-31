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
    
    var xmlFiles = ["barrack.xml", "cabin.xml", "hangar.xml", "house.xml", "level.xml", "mine.xml"];
    for(var i=0; i<xmlFiles.length; i++ ) {
        resourceManager.add("xml/" + xmlFiles[i], "xml");
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

    var cellUnitX = 16;
    var cellUnitY = 8;
    var cellUnit = 8;

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

        cell.sux = 0;
        cell.suy = 0;

        map.addChild(cell);
        logicMap.addRect(0, 0, cellSize, cellSize);

        cell.addEventListener(Event.GESTURE_DRAG, function(e) {
            cell.dx += e.data.x;
            cell.dy += e.data.y;

            var fdux = (cell.dx - 2 * cell.dy) / 4 / cellUnit;
            var fduy = (cell.dx + 2 * cell.dy) / 4 / cellUnit;

            var dux = (fdux > 0 ? 1:-1) * Math.floor(Math.abs(fdux));
            var duy = (fduy > 0 ? 1:-1) * Math.floor(Math.abs(fduy));

            //trace(cell.dx + ":" + cell.dy + "," + dux + ":" + duy);

            if( dux == 0 && duy == 0 ) {
                return;
            }
            
            cell.ux = cell.sux + dux;
            if( cell.ux < 0 ) {
                cell.ux = 0;
            }

            if( cell.ux >= (worldWidth - cellSize) ) {
                cell.ux = worldWidth - cellSize - 1;
            }
            
            cell.uy = cell.suy + duy;
            if( cell.uy < 0 ) {
                cell.uy = 0;
            }
            if( cell.uy >= (worldHeight - cellSize) ) {
                cell.uy = worldHeight - cellSize - 1;
            }

            cell.x = cornerX + (cell.ux+cell.uy)*cellUnitX;
            cell.y = cornerY + (-cell.ux+cell.uy)*cellUnitY;
        });

        cell.addEventListener(Event.GESTURE_DRAG_END, function(e) {
            cell.dx = 0;
            cell.dy = 0;

            cell.sux = cell.ux;
            cell.suy = cell.uy;
        });
    });

    global.stage.addChild(map);
}

function prepareWindow() {
}
