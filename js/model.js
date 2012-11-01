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

User.stat = {
    xp      : 100,
    score   : 0,
    coin    : 0,
    mine    : 0,
    cash    : 0,
    worker  : 2,
    working : 0,
};

User.map = {
    1010 : {type:'House', level:1, timer:0},
    1010 : {type:'Mine', level:1, timer:0},
    1020 : {type:'Bank', level:1, stored:0},
    1020 : {type:'Silo', level:1, stored:0},
    1030 : {type:'Hangar', level:1},
    //1030 : {type:'Defence', name='snipper', level:1},
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
