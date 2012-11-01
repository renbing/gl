/**
 * Created by renbing
 * User: renbing
 * Date: 12-10-30
 * Time: 下午2:17
 *
 */

global.GAME_WIDTH = 960 * 1.5;
global.GAME_HEIGHT = 640 * 1.5;
global.gameFPS = 25;
global.renderFPS = 60;
global.resourceDirectory = "resources/";
global.mediaDirectory = "resources/";
global.isShowRect = true;

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

global.assets = [

// 配置文件
    "building.csv",

// 图片资源
    "bg.jpg",

    "base1.png",
    "base4.png",
    "base6.png",
    "base8.png",
    "base10.png",
    "base12.png",
    "base_broken1.png",
    "base_broken4.png",
    "base_broken6.png",
    "base_broken8.png",
    "base_broken10.png",
    "base_broken12.png",

    "bank_1.png",
    "bank_2.png",
    "bank_3.png",
    "barracks_1.png",
    "barracks_2.png",
    "barracks_3.png",
    "hangar_001_01_ready.png",
    "hangar_001_02_ready.png",
    "hangar_001_ready.png",
    "headquarter_1.png",
    "headquarter_2.png",
    "headquarter_3.png",
    "headquarter_4.png",
    "house_1.png",
    "house_2.png",
    "house_3.png",
    "house_4.png",
    "house_5.png",
    "machine_1.png",
    "machine_2.png",
    "machine_3.png",
    "mine_1.png",
    "mine_2.png",
    "mine_3.png",
    "mine_4.png",
    "shipyard_1.png",
    "shipyard_2.png",
    "shipyard_3.png",
    "silo_1.png",
    "silo_2.png",
    "silo_3.png",
];
