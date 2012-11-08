/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-06
 * Time: 上午11:28
 *
 */

var UI = {};
UI.Window = function() {
    this.mc = new MovieClip("window");
    this.width = this.width || 600;
    this.height = this.height || 400;

    this.mc.x = (global.GAME_WIDTH - this.width)/2;
    this.mc.y = 100;

    this.mc.addChild(new FillRect(0, 0, this.width, this.height, global.Color.WHITE));
    var closeBtn = new MovieClip("closeButton");
    closeBtn.x = this.width-20;
    closeBtn.y = -20;
    closeBtn.addChild(new FillRect(0, 0, 40, 40, global.Color.RED));
    closeBtn.addChild(new TextField("关闭", "18px sans-serif", "", 40, 40));
    closeBtn.addEventListener(Event.MOUSE_CLICK, function(e) {
        this.hide();
    }.bind(this));
    this.mc.addChild(closeBtn);

    this.hide = function() {
        global.stage.removeChild(this.mc);
    };

    this.show = function() {
        global.stage.addChild(this.mc);
    };
};

UI.TestWindow = function(buttons){
    this.width = 670;
    this.height = 410;

    UI.Window.call(this);

    var i=0;
    for( var key in buttons ) {
        var name = buttons[key];
        var mc = new MovieClip(key);
        mc.x = 10 + (i%6) * 110;
        mc.y = 10 + Math.floor(i/6) * 40;

        mc.addChild(new FillRect(0, 0, 100, 30, global.Color.BLACK));
        mc.addChild(new TextField(name, "16px sans-serif", global.Color.WHITE, 100, 30, 'center'));

        mc.addEventListener(Event.MOUSE_CLICK, function(e) {
            global.button.onClick(this.mc.name);
            this.hide();
        }.bind(this));

        this.mc.addChild(mc);
        
        i += 1;
    }
};

UI.CharacterWindow = function(items, type){

    this.width = 720;
    this.height = 500;
    this.itemWidth = 120;
    this.itemHeight = 100;

    this.items = items;
    this.building = null;
    this.masks = {};

    UI.Window.call(this);

    var i=0;
    for( var id in items ) {
        var name = items[id];
        var mc = new MovieClip(id);
        mc.x = 20 + (i%5) * (this.itemWidth + 20);
        mc.y = 20 + Math.floor(i/5) * (this.itemHeight + 40 + 20);

        var itemPic = resourceManager.get("shop/"+id+".png");
        mc.addChild( new Texture(itemPic, 0, 0, itemPic.width, itemPic.height, 
                    (this.itemWidth-itemPic.width)/2, (this.itemHeight-itemPic.height)/2, itemPic.width, itemPic.height));
        
        var panel = this;
        var callback = function(){
            panel.hide(); 
            var segs = this.name.split("."); 
            var character = segs[1];
            if( segs[0] == "train" ) {
            }else if( segs[0] == "research" ) {
                panel.building.research(character);
            }
        };

        var tmp;
        var button = new MovieClip(type + "." + id);
        tmp = new FillRect(0, 0, 100, 30, global.Color.BLACK);
        tmp.y = this.itemHeight+10;
        button.addChild(tmp);
        var buttonName = (type == "train") ? "训练" : "升级";
        tmp = new TextField(buttonName, "16px sans-serif", global.Color.WHITE, 100, 30, 'center');
        tmp.y = this.itemHeight+10;
        button.addChild(tmp);
        mc.addChild(button);
        button.addEventListener(Event.MOUSE_CLICK, callback);

        this.mc.addChild(mc);

        var mask = new MovieClip("mask." + id);
        mask.visible = false;
        mask.x = mc.x;
        mask.y = mc.y;
        mask.addChild(new FillRect(0, 0, this.itemWidth, this.itemHeight+40, global.Color.BLACK, 0.5));

        this.masks[id] = mask;
        this.mc.addChild(mask);

        i += 1;
    }
};

UI.CharacterWindow.prototype.update = function(building) {
    this.building = building;
    
    if( this.building.buildingBaseConf.BuildingClass == "Army" ) {
        for( var id in this.items ) {
            var characterConf = global.csv.character.get(id, 1);
            this.masks[id].visible = characterConf.BuildingLevel > this.building.data.level;
        }
    }else if( this.building.buildingBaseConf.BuildingClass == "Laboratory" ) {
        for( var corner in global.model.map ) {
            var building = global.model.map[corner];
            if( building.buildingBaseConf.BuildingClass == "Army" ) {
                // 修改characters.csv中CharacterClass 为BuildingClass
                // 获取building对应的character
                // 获取解锁的character合集
            }
        }
    }
};

UI.BuildingActionType = {
   INFO         : "info",
   UPGRADE      : "upgrade",
   CLEAR        : "clear",
   TRAIN        : "train",
   RESEARCH     : "research",
   CANCEL       : "cancel",
   ACCELERATE   : "accelerate",
};

UI.BuildingActionWindow = function(buttons) {

    this.width = 550;
    this.height = 50;
    this.building = null;

    UI.Window.call(this);
    
    for( var key in UI.BuildingActionType ) {
        var type = UI.BuildingActionType[key];
        
        var text = "";
        if( type == UI.BuildingActionType.INFO ) {
            text = "查看";
        }else if( type == UI.BuildingActionType.UPGRADE ) {
            text = "升级";
        }else if( type == UI.BuildingActionType.CLEAR ) {
            text = "清理";
        }else if( type == UI.BuildingActionType.TRAIN ) {
            text = "训练";
        }else if( type == UI.BuildingActionType.RESEARCH ) {
            text = "研究";
        }else if( type == UI.BuildingActionType.CANCEL ) {
            text = "取消";
        }else if( type == UI.BuildingActionType.ACCELERATE ) {
            text = "加速";
        }else {
            continue;
        }

        var mc = new MovieClip(type);
        mc.visible = false;
        mc.addChild(new FillRect(0, 0, 150, 30, global.Color.BLACK));
        mc.addChild(new TextField(text, "16px sans-serif", global.Color.WHITE, 150, 30, 'center'));
        mc.y = 10;

        var panel = this;
        mc.addEventListener(Event.MOUSE_CLICK, function(e){
            if( this.name == "upgrade" || this.name == "clear" || this.name == "cancel" || this.name == "accelerate" ) {
                panel.building[this.name]();
            }else if( this.name == "train" || this.name == "research" ) {
                global.windows.character[panel.building.data.id].update(panel.building);
                global.windows.character[panel.building.data.id].show();
            }else if( this.name == "research" ) {
                global.windows.character_upgrade.show();
            }
            panel.hide();
        });

        this.mc.addChild(mc);
    }
};

UI.BuildingActionWindow.prototype.update = function(buttons, building) {
    this.building = building;
    buttons = buttons || [];

    for( var key in UI.BuildingActionType ) {
        this.mc.getChildByName(UI.BuildingActionType[key]).visible = false;
    }
        
    for( var i=0; i<=buttons.length ; i++ ) {
        var type;
        if( i == 0 ) {
            type = UI.BuildingActionType.INFO;
        }else{
            type = buttons[i-1][0];
        }

        var mc = this.mc.getChildByName(type);
        mc.visible = true;
        
        if( type == UI.BuildingActionType.UPGRADE ) {
            var data = buttons[i-1][1];
            mc.getChildAt(1).text = "升级:" + data.num + " " + data.resource;
        }else if( type == UI.BuildingActionType.CLEAR ) {
            var data = buttons[i-1][1];
            mc.getChildAt(1).text = "清理:" + data.num + " " + data.resource;
        }else if( type == UI.BuildingActionType.ACCELERATE ) {
            var data = buttons[i-1][1];
            mc.getChildAt(1).text = "加速:" + data.cash + "宝石";
        }

        mc.y = 10;
        mc.x = 20 + i * 170;
    }
};
