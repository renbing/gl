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
        this.text = this.label.text = (text !== undefined && text !== null) ? text : '';
        this.label.font = font || '14px sans-serif';
        this.label.fillStyle = color || '#ffffff';
        this.label.width = width || 32;
        this.label.height = height || 32;
        this.label.textAlign  = textAlign || 'left'; //left, center, right
    }

    proto.render = function(x, y) {
        if(!this.visible || undefined === this.label.text || null === this.label.text 
            || this.label.text.length == 0) return;

        var dx = this.x + x;
        var dy = this.y + y;

        var bounds = {x:dx, y:dy, w:this.label.width, h:this.label.height};
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

        return bounds;
    }

    proto.setColor = function(color) {
        this.label.fillStyle = color || '#ffffff';
        return this;
    };

    proto.setText = function(text) {
        this.text = this.label.text = (text !== undefined && text !== null) ? text : '';
        return this;
    };


    proto.setFont = function(font) {
        this.label.font = font || '14px sans-serif';
        return this;
    };

    proto.setFillStyle = function(fillStyle) {
        this.label.fillStyle = fillStyle || '#ffffff';
        return this;
    };

    proto.setAlign = function(align) {
        this.label.textAlign  = align || 'left'; //left, center, right
    };

    roseCore.TextField = TextField;

})();
