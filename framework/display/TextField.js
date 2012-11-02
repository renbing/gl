/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-20
 * Time: 上午10:07
 *
 */

/**
 * 文字域类
 *
 * 工厂模式
 *
 */
(function () {
    
    var proto = TextField.prototype;

    function TextField(text, font, color, width, height, textAlign) {

        this.ctx = global.context2d;
        this.x = 0;
        this.y = 0;
        this.visible = true;

        this.label = global.isInBrowser ? new Object() : new Label();
        this.label.text = (text !== undefined && text !== null) ? text : '';
        this.label.font = font || '14px sans-serif';
        this.label.fillStyle = color || '#ffffff';
        this.label.width = width || 32;
        this.label.height = height || 32;
        this.label.textAlign  = textAlign || 'left'; //left, center, right

        this.bounds = {x:this.x, y:this.y, w:this.label.width, h:this.label.height};
    }

    proto.render = function(x, y) {
        if(!this.visible || undefined === this.label.text || null === this.label.text 
            || this.label.text.length == 0) return;

        var dx = this.x + x;
        var dy = this.y + y;

        this.bounds.x = dx;
        this.bounds.y = dy;

        if( global.isInBrowser ) {

            if (global.isShowRect) {
                this.ctx.beginPath();
                this.ctx.rect(dx, dy, this.label.width, this.label.height);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            dy += parseInt(this.label.font);
            switch (this.label.textAlign){
                case 'center':
                    this.ctx.textAlign = 'center';
                    dx += this.label.width / 2;
                    break;
                case 'left':
                    this.ctx.textAlign = 'left';
                    break;
                case 'right':
                    this.ctx.textAlign = 'right';
                    dx += this.label.width;
                    break;
            }

            var savedFillStyle = this.ctx.fillStyle;

            this.ctx.font = this.label.font;
            this.ctx.fillStyle = this.label.fillStyle;
            this.ctx.fillText(this.label.text, dx, dy);

            this.ctx.fillStyle = savedFillStyle;

        } else {
            this.ctx.drawLabel(this.label, dx, dy);
        }
    }

    proto.__defineSetter__("text", function(text) {
        this.label.text = (text !== undefined && text !== null) ? text : '';
    });

    proto.__defineGetter__("text", function() {
        return this.label.text;
    });

    proto.__defineSetter__("color", function(color) {
        this.label.fillStyle = color || '#ffffff';
    });

    proto.__defineGetter__("color", function() {
        return this.label.fillStyle;
    });

    proto.__defineSetter__("font", function(font) {
        this.label.font = font || '14px sans-serif';
    });

    proto.__defineGetter__("font", function() {
        return this.label.font;
    });

    proto.__defineSetter__("align", function(align) {
        this.label.textAlign  = align || 'left'; //left, center, right
    });

    proto.__defineGetter__("align", function() {
        return this.label.textAlign;
    });

    roseCore.TextField = TextField;

})();
