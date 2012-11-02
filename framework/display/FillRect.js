/**
 * Created by Bing Ren
 * User: Bing Ren
 * Date: 12-4-15
 * Time: 上午11:00
 *
 */

(function () {

    function FillRect(x, y, w, h, color, alpha) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dw = w;
        this.dh = h;
        this.color = color; // #ffffff
        this.alpha = alpha;

        this.parent = null;
        this.bounds = {x:x, y:y, w:w, h:h};
    }
    
    roseCore.FillRect = FillRect;

})();
