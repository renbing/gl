/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-15
 * Time: 上午11:04
 *
 */

var roseCore = {};
var canvas;
var setMainLoop;
var trace;
var Label;

var global = {
    GAME_WIDTH: 0,
    GAME_HEIGHT: 0,
    stage: null,
    canvas: null,
    context2d: null,
    isInBrowser: !canvas, //如果canvas已经定义，表示在壳里，否则在浏览器里。
    resourceDirectory: "/",
    mediaDirectory: "/",
    textureDirectory : "resources/texture/",
    configFileDirectory : "js/configFiles/",
    backgroundColor: "#000000",
    uid:"1862111"
};

Function.prototype.bind = function() {
    var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift();
    return function() {
        return fn.apply(object,
            args.concat(Array.prototype.slice.call(arguments)));
    };
};

(function() {
    var defineClass = function(className, constructor, members, superclass) {
        var key;
        if (superclass) {
            if (typeof superclass == 'string'){
                superclass = global[superclass];
            }
            var newPrototype = new superclass();
            var newFunc = function() {
                superclass.apply(this, arguments);
                constructor.apply(this, arguments)
            };
            newFunc.prototype = newPrototype;
            newPrototype.constructor = newFunc;
            global[className] = newFunc;
            for (key in members) {
                newPrototype[key] = members[key];
            }
        } else {
            global[className] = constructor;
            var oriPrototype = constructor.prototype;
            for (key in members) {
                oriPrototype[key] = members[key];
            }
        }
    };
    roseCore.defineClass = defineClass;
})();

