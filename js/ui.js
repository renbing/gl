/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-06
 * Time: 上午11:28
 *
 */

var UI = {};
UI.TestWindow = function(buttons){
    this.buttons = buttons;

    this.mc = new MovieClip("testwindow");
    this.mc.x = (global.GAME_WIDTH - 670)/2;
    this.mc.y = (global.GAME_HEIGHT - 410)/2;
    this.mc.addChild(new FillRect(0, 0, 670, 410, global.Color.WHITE));
    var close = new MovieClip("closeButton");
    close.x = 650;
    close.y = -20;
    close.addChild(new FillRect(0, 0, 40, 40, global.Color.RED));
    close.addChild(new TextField("关闭", "18px sans-serif", "", 40,40));
    close.addEventListener(Event.MOUSE_CLICK, function(e) {
        this.hide();
    }.bind(this));

    this.mc.addChild(close);
    
    var i=0;
    for( var key in buttons ) {
        var name = buttons[key];
        var mc = new MovieClip(key);
        mc.x = 10 + (i%6) * 110;
        mc.y = 10 + Math.floor(i/6) * 40;

        mc.addChild(new FillRect(0, 0, 100, 30, global.Color.BLACK), 0);
        mc.addChild(new TextField(name, "16px sans-serif", global.Color.WHITE, 100, 30, 'center'));

        mc.addEventListener(Event.MOUSE_CLICK, function(e) {
            global.button.onClick(this.name);
        });

        this.mc.addChild(mc);
        
        i += 1;
    }
};

UI.TestWindow.prototype.show = function() {
    global.stage.addChild(this.mc);
};

UI.TestWindow.prototype.hide = function() {
    global.stage.removeChild(this.mc);
};
