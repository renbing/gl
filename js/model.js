/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-01
 * Time: 下午2:47
 *
 */

/**
 * 数据模型
 */

var User = {};

User.base = {
    xp      : 100,
    score   : 0,
    coin    : 0,
    mine    : 0,
    cash    : 0,
    worker  : 2,
    working : 0,
};

User.map = {
    1010 : {id:'house', level:1, timer:0},
    2010 : {id:'mine', level:1, timer:0},
    3020 : {id:'bank', level:1, stored:0},
    4020 : {id:'silo', level:1, stored:0},
    5030 : {id:'barrack', level:1},
    6030 : {id:'hangar', level:1},
};

User.troops = {
    ground : {
            soldier : 0,
            marine : 0,
        },
    air : {
    }
};

User.mission = {
    1 : [0,0,0], 
};
