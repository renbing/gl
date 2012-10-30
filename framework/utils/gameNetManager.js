/**
 * Created by DeyongZ.
 * User: DeyongZ
 * Date: 12-3-21
 * Time: 下午3:31
 *
 */

(function() {
	
	var proto = GameNetManager.prototype;

    function GameNetManager() {
        //this.hostName = global.isInBrowser ? "http://localhost/" : "http://10.253.48.49:82/";
        this.hostName = "";
        this.isInited = false;
        this.gateWayUrl = "/knightphp/gateway.php";
        this.authKey = "20ee14bc7478a971b2143d3e5b419974";
        this.authTime = 1332402108;
        this.platformId = '1862111';//"2";//"1862111";
        this.uid = '1862111';//"2";//"1862111";
        this.uid_sn = this.uid;
        this.un = "1862111";
        this.headpic = "";
    }

    proto._makeRequest = function(args, callback, appendArgs) {
        var actions = [];
        for (var key in args) {
            var action = {};
            action["mod"] = args[key].mod;
            action["act"] = args[key].act;
            var argsInArg = args[key].args;
            for (var paramkey in argsInArg) {
                action[paramkey] = argsInArg[paramkey];
            }
            actions.push(action);
        }
        var requestArgs = {};
        var content = actions;
        var key = this._encrypt(content);
        requestArgs.parameter = content;
        requestArgs.randkey = key;
        requestArgs.auth_key = this.authKey;
        requestArgs.auth_time = this.authTime;
        requestArgs.uid = this.uid;
        requestArgs.uid_sn = this.uid_sn;
        this.uid_sn++;
        //var sendmes = this.gateWayUrl + "?" + JSON.stringify(requestArgs);
        trace(JSON.stringify(requestArgs));
        ajax.post(this.gateWayUrl, requestArgs, function (xhr, str){
            global.waitingPanel.hide();
            var data = undefined;
            try{
                data = eval("("+str+")");
            }
            catch(err){
                trace("server error:"+err);
                global.soundManager.playEffect("error.mp3");
                return;
            }
            if(data && data.code == 0){
                if(data.data && global.dataCenter.data){
                    global.dataCenter.data.newreport = data.data.newreport;//显示有没有新的战报
                    global.uiFriendList.updateReportIcon();
                }
                callback(data);
            }
            else{
                if(data.code == 9 && data.desc == 'mine_too_often' && data.num == 1){
                    callback(data);
                    return;
                }
                global.soundManager.playEffect("error.mp3");
                if(typeof(data) == 'object'){
                    trace("server error" + JSON.stringify(data));
                    global.dialog(data.desc);
                }
                else
                    trace("server error" + str);
            }

        });
    };

    proto._encrypt = function(str) {
        var result = roseCore.encryptMD5(str + this.auth_time);
        if (result.length > 9) {
            result = result.slice(0, 9);
        }
        return result;
    };

    proto.call = function(mod, action, args, callback, extraargs) {
        global.waitingPanel.show();
        global.waitingPanel.setText(extraargs);
        this._makeRequest([
            { "mod":mod, "act":action, "args":args }
        ], callback, extraargs);
    };

    proto.callWithoutWaiting = function(mod, action, args, callback, extraargs) {
        this._makeRequest([
            { "mod":mod, "act":action, "args":args }
        ], callback, extraargs);
    };

    proto.changeUid = function(uid) {
        this.platformId = this.uid = this.uid_sn = uid;
    };

    global.NetManager = new GameNetManager();
}());
