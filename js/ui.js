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
    this.mc.y = (global.GAME_HEIGHT - this.height)/2;

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

UI.CharacterWindow = function(items){

    this.width = 580;
    this.height = 400;
    this.itemWidth = 120;
    this.itemHeight = 100;

    UI.Window.call(this);

    var i=0;
    for( var key in items ) {
        var name = items[key];
        var mc = new MovieClip(key);
        mc.x = 20 + (i%4) * (this.itemWidth + 20);
        mc.y = 20 + Math.floor(i/4) * (this.itemHeight + 40 + 20);

        var itemPic = resourceManager.get("shop/"+key+".png");
        mc.addChild( new Texture(itemPic, 0, 0, itemPic.width, itemPic.height, 
                    (this.itemWidth-itemPic.width)/2, (this.itemHeight-itemPic.height)/2, itemPic.width, itemPic.height));
        
        var panel = this;
        var callback = function(){
            panel.hide(); 
            var segs = this.name.split("."); 
            var character = segs[1];
            if( segs[0] == "construct" ) {
            }else if( segs[0] == "upgrade" ) {
                var now = Math.round(+new Date() / 1000);
                var data = global.model.laboratory[character];
                if( data && data.timer > 0 ) {
                    alert("正在升级中");
                    return;
                }

                if( !data ) {
                    data = {level : 0, timer : 0};
                }

                var characterConf = global.csv.character.get(character, conf.level + 1);
                if( !characterConf ) {
                    alert("无法升级,以及达到顶级");
                }

                if( global.model.updateHud(characterConf.UpgradeResource, -characterConf.UpgradeCose) ) {
                    return;
                }

                data.timer = now + characterConf.UpgradeTimeH * 3600;
                global.model.laboratory[character] = data;
            }
        };

        var tmp;
        var construct = new MovieClip("construct." + key);
        tmp = new FillRect(0, 0, 45, 30, global.Color.BLACK);
        tmp.y = this.itemHeight+10;
        construct.addChild(tmp);
        tmp = new TextField("建造", "16px sans-serif", global.Color.WHITE, 45, 30, 'center');
        tmp.y = this.itemHeight+10;
        construct.addChild(tmp);
        mc.addChild(construct);
        construct.addEventListener(Event.MOUSE_CLICK, callback);

        var upgrade = new MovieClip("upgrade." + key);
        var tmp = new FillRect(0, 0, 45, 30, global.Color.BLACK);
        tmp.x = 55;
        tmp.y = this.itemHeight + 10;
        upgrade.addChild(tmp);
        tmp = new TextField("升级", "16px sans-serif", global.Color.WHITE, 45, 30, 'center');
        tmp.x = 55;
        tmp.y = this.itemHeight + 10;
        upgrade.addChild(tmp);
        mc.addChild(upgrade);
        upgrade.addEventListener(Event.MOUSE_CLICK, callback);

        this.mc.addChild(mc);
        i += 1;
    }
};
