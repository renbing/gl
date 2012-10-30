/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-16
 * Time: 下午6:13
 *
 */

(function(){
    var shellTrace = trace;
    var innerTrace = function(){
        if (global.isInBrowser){
            return function(str){
                console.log(str);
            };
        }else{
            return shellTrace;
        }
    }();
    roseCore.trace = innerTrace;
})();
