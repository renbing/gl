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
global.mediaDirectory = "resources/music/";
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

global.Assets = [

// 配置文件
    "csv/buildings.csv",
    "csv/levels.csv",
    "csv/townhall_levels.csv",
    "csv/obstacles.csv",
    "csv/globals.csv",

// 图片资源
    "image/bg.jpg",

    "image/base1.png",
    "image/base4.png",
    "image/base6.png",
    "image/base8.png",
    "image/base10.png",
    "image/base12.png",
    "image/base_broken1.png",
    "image/base_broken4.png",
    "image/base_broken6.png",
    "image/base_broken8.png",
    "image/base_broken10.png",
    "image/base_broken12.png",

    "image/gold_storage_1.png",
    "image/gold_storage_2.png",
    "image/gold_storage_3.png",
    "image/town_hall_1.png",
    "image/town_hall_2.png",
    "image/town_hall_3.png",
    "image/town_hall_4.png",
    "image/gold_mine_1.png",
    "image/gold_mine_2.png",
    "image/gold_mine_3.png",
    "image/gold_mine_4.png",
    "image/gold_mine_5.png",
    "image/elixir_pump_1.png",
    "image/elixir_pump_2.png",
    "image/elixir_pump_3.png",
    "image/elixir_pump_4.png",
    "image/elixir_storage_1.png",
    "image/elixir_storage_2.png",
    "image/elixir_storage_3.png",

    "image/barrack_1.png",
    "image/barrack_2.png",
    "image/barrack_3.png",
    "image/troop_housing_1.png",
    "image/troop_housing_2.png",
    "image/troop_housing_3.png",
    "image/laboratory_1.png",
    "image/laboratory_2.png",
    "image/laboratory_3.png",

    "image/cannon_1.png",
    "image/archer_tower_1.png",
    "image/air_defense_1.png",
    "image/wizard_tower_1.png",
    "image/mortar_1.png",
    "image/wall_1.png",
    "image/wall_2.png",
    "image/wall_3.png",

    "image/shipyard_1.png",
    "image/shipyard_2.png",
    "image/shipyard_3.png",

    "obstacle/deco_crashship_1.png",
    "obstacle/deco_crater_1.png",
    "obstacle/deco_plant_1.png",
    "obstacle/deco_rock_1.png",
    "obstacle/deco_tree_1.png",
    "obstacle/deco_longolemonus_1.png",
    "obstacle/deco_mielindrocus_1.png",
    "obstacle/deco_spirocles_1.png",
    "obstacle/deco_trenamora_1.png",
    "obstacle/deco_bluerock_1.png",
    "obstacle/deco_brownrock_1.png",
    "obstacle/deco_firerock_1.png",
    "obstacle/deco_greenrock_1.png",
    "obstacle/deco_fire_crater_1.png",
    "obstacle/deco_christmas_1.png",
    "obstacle/deco_christmas_1.png",
    "obstacle/deco_darkrelus_1.png",
    "obstacle/deco_fungandano_1.png",
    "obstacle/deco_bambuspade_1.png",
    "obstacle/deco_radquid_1.png",
    "obstacle/deco_ciprescomun_1.png",
    "obstacle/deco_lappleper_1.png",
    "obstacle/deco_simbarfa_1.png",
    "obstacle/deco_yellowcris_1.png",
    "obstacle/deco_korice_1.png",
    "obstacle/deco_emerstone_1.png",
    "obstacle/deco_pigmera_1.png",
    "obstacle/deco_blueloon_1.png",
    "obstacle/deco_crecita_1.png",
    "obstacle/deco_shrumic_1.png",
    "obstacle/deco_yelluns_1.png",
    "obstacle/deco_rioney_1.png",
    "obstacle/deco_habuoya_1.png",
    "obstacle/deco_margalight_1.png",
    "obstacle/deco_strebius_1.png",
    "obstacle/deco_viotal_1.png",
    "obstacle/deco_vectal_1.png",
    "obstacle/deco_bigdig_1.png",
    "obstacle/deco_derea_1.png",
    "obstacle/deco_pinlet_1.png",
];
