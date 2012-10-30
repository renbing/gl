/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-15
 * Time: 上午11:00
 *
 */

(function () {

    function Texture(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.img = img;
        this.sx = sx || 0;
        this.sy = sy || 0;
        this.sw = sw || img.width;
        this.sh = sh || img.height;
        this.dx = dx || 0;
        this.dy = dy || 0;
        this.dw = dw || img.width;
        this.dh = dh || img.height;
        this.parent = null;
        this.rotation = 0;
    }
    
    roseCore.Texture = Texture;

})();
