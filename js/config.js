/**
 * Created by renbing
 * User: renbing
 * Date: 12-10-30
 * Time: 下午2:17
 *
 */

global.GAME_WIDTH = 960 ;//* 1.5;
global.GAME_HEIGHT = 640 ;//* 1.5;
global.gameFPS = 25;
global.renderFPS = 60;
global.resourceDirectory = "resources/";
global.mediaDirectory = "resources/";
global.isShowRect = false;

global.Map = {
    unitW : 78,
    unitH : 72,
    cellUnitX : 16,
    cellUnitY : 8,
    cellUnit : 8,
    startX : 286+117,
    startY : 1342-150,
};

//系统颜色定义
global.Color = {
    WHITE : "#ffffff",
    GREEN : "#00ff00",
    RED : "#ff0000",
    BLUE : "#0000ff",
    BLACK : "#000000",
    YELLOW : "#ffff00",
    PINK : "#ff00ff"
};
