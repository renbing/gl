/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-13
 * Time: 下午12:25
 *
 */

/**
 * 纹理管理器，单例
 * 纹理打包分为按libName/linkName 打包两种方式: libName/libName.(png/tp.json) libName/linkName.(png/tp.json)
 */

(function () {
    
    function LoadProcessor(onAllLoaded, onLoaded) {
        this.loadTotalCount = 0;
        this.loadedCount = 0;

        this.onAllLoaded = onAllLoaded;
        this.onLoaded = onLoaded;

        this.started = false;
    }

    LoadProcessor.prototype.deliveryPackage = function() {
        this.loadTotalCount ++;
    };

    LoadProcessor.prototype.loadSuccess = function() {
        this.loadedCount++; 
        this.onLoaded && this.onLoaded();

        if( this.started ) {
            this.checkAllLoaded();
        }

    };

    LoadProcessor.prototype.getProgressPercent = function() {
        return (this.loadedCount / this.loadTotalCount * 100).toFixed(0);
    };

    LoadProcessor.prototype.start = function() {
        this.started = true;
        this.checkAllLoaded();
    };

    LoadProcessor.prototype.checkAllLoaded = function() {

        if (this.loadedCount >= this.loadTotalCount) {

            this.onAllLoaded && this.onAllLoaded();
        }
    }

    function BitArray(len) {
        this.len = len;
        this.bitsPerByte = 32;

        this.bytes = [];
    }

    BitArray.prototype.setBit = function(index, bit) {
        if( index < 0 || index >= this.len ) {
            return;
        }

        var byteIndex = Math.floor(index / this.bitsPerByte);
        var bitIndex = index % this.bitsPerByte;
        if( bit ) { 
            this.bytes[byteIndex] |= (1 << bitIndex);
        } else if( this.getBit(index) ){
            this.bytes[byteIndex] ^= (1 << bitIndex);
        }
    };

    BitArray.prototype.getBit = function(index) {
        if( index < 0 || index >= this.len ) {
            return null;
        }

        var byteIndex = Math.floor(index / this.bitsPerByte);
        var bitIndex = index % this.bitsPerByte;

        return ((this.bytes[byteIndex] >> bitIndex) & 1);
    };

    var textureLoader = {};

    var libraries = {};
    var textures = {};
    var images = {};

    /* 预加载素材库
     * @param config: 素材库配置文件 {libName:[linkName,linkName]}
     * @param loadProcessor: 进度管理器
     */
    function preload(config, loadProcessor){
        for (var key in config) {
            if( global.isInBrowser ) {
                loadLibrary(key, config[key], true, loadProcessor);
            } else {
                loadLibrary(key, config[key], true, loadProcessor);
            }
        }
    }
    
    /* 卸载一个素材库
     * @param libName: 库名
     * @optional linkNameArr: 只卸载libName中的指定一些链接
     */
    function unloadLibrary(libName, linkNameArr) {
        if( !(libName in libraries) ) {
            return;
        }
        
        // 如果没有指定链接,则删除所有的链接
        if( !linkNameArr ) {
            linkNameArr = [];
            for( var linkName in libraries[libName].links ) {
                linkNameArr.push(linkName);
            }
        }
        
        var imgs = [];
        if( !libraries[libName].isPacked ) {
            for( var i=0; i<linkNameArr.length; i++ ) {
                var linkName = linkNameArr[i];
                var texture = textures[libName + '/' + linkName];
                if( texture ) {
                    texture.counter --;
                    if( texture.counter <= 0 ) {
                        imgs.push( texture.img );
                        delete textures[libName + '/' + linkName];
                        delete libraries[libName].links[linkName];
                    }
                }
            }
        }else{
            // 清理Library中的链接
            for( var i=0; i<linkNameArr.length; i++ ) {
                var linkName = linkNameArr[i];
                delete libraries[libName].links[linkName];
            }
        
            // 判断库是否没有链接了,如果没有则删除库
            var isEmpty = true;
            for( var key in libraries[libName].links ) {
                isEmpty = false;
                break;
            }

            if( isEmpty ) {
                // 如果打包的库没有链接了,处理释放
                var texture = textures[libName + '/' + libName];
                if( texture ) {
                    texture.counter --;
                    if( texture.counter <= 0 ) {
                        imgs.push( texture.img );
                        delete textures[libName + '/' + libName];
                    }
                }
            }
        }
        
        // 在壳中,主动调用一下纹理释放
        if( !global.isInBrowser ) {
            for( var i=0; i<imgs.length; i++ ) {
                imgs[i].freemem();
            }
        }
        imgs = null;

        if( isEmpty ) {
            delete libraries[libName];
        }
    }

    function loadLibrary(libName, linkNameArr, isPacked, loadProcessor) {
        if( !libName ) {
            return;
        }

        if( !(libName in libraries) ) {
            libraries[libName] = {
                isPacked : isPacked,
                links:{}
            };
        }

        if( isPacked ) {
            _loadTexture(libName + '/' + libName, loadProcessor);
        }

        for (var n = 0, m = linkNameArr.length; n < m; n++) {
            var linkName = linkNameArr[n];
            if( !linkName ) {
                continue;
            }
            if( !(linkName in libraries[libName].links) ) {
                libraries[libName].links[linkName] = null;
            }

            if( !isPacked ) {
                _loadTexture(libName + '/' + linkName, loadProcessor);
            }

            // 浏览器中才预加载导出配置
            if( global.isInBrowser ) {
                _loadLinkFile(libName, linkNameArr[n], loadProcessor);
            }
        }
    }

    function _loadTexture(path, loadProcessor) {
        if( !textures[path] ) {
            textures[path] = {
                img : null,
                config : null,
                counter : 0
            };
        }
        textures[path].counter++;

        var image = new Image;
        var imageFileName = global.textureDirectory + path + '.png';
        loadProcessor.deliveryPackage();

        image.onload = function () {
            if( textures[path].img ) {
                loadProcessor.loadSuccess();
                return;
            }

            if( global.isInBrowser ) {
                var canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                
                image.alphas = new BitArray(imageData.height * imageData.width);

                for( var y=0, maxY=imageData.height; y<maxY; y++ ) {
                    for( var x=0, maxX=imageData.width; x<maxX; x++ ) {
                        if( imageData.data[(x + y * maxX) * 4 + 3] >= 5 ) {
                            image.alphas.setBit( x+y*maxX, 1);
                        }
                    }
                }

                image.alphaTest = function(x, y) {
                    return this.alphas.getBit(y*this.width + x);
                };
            }
            textures[path].img = image;
            image = null;
            loadProcessor.loadSuccess();
        };
        image.src = imageFileName;

        var configFile = global.textureDirectory + path + ".tp.json";
        var useShellFile = !global.isInBrowser;
        loadProcessor.deliveryPackage();

        ajax.get(configFile, function(url, xhr) {
            var data = eval('(' + xhr.responseText + ')');
            textures[path].config = data;
            loadProcessor.loadSuccess();
        }, useShellFile);
    }

    function _loadLinkFile(libName, linkName, loadProcessor) {

        var linkConfigFile = global.textureDirectory + libName + "/" + linkName + ".json";
        var useShellFile = !global.isInBrowser;
        loadProcessor.deliveryPackage();

        ajax.get(linkConfigFile, function(url, xhr) {
            var data = eval('(' + xhr.responseText + ')');
            libraries[libName].links[linkName] = data;
            loadProcessor.loadSuccess();
        }, useShellFile);
    }

    function unloadAll() {
        for( var address in images ) {
            if( !global.isInBrowser ) {
                images[address].freemem();
            };
        }
        images = [];

        for( var libName in libraries ) {
            unloadLibrary(libName);
        }
        libraries = [];

        textures = [];
    }

    function createMovieClip(libName, linkName) {
        var library = libraries[libName];
        if(!library)
        {
            trace("can't find " + libName);
            return new MovieClip();
        }
        var mcConf = library.links[linkName];
        if( !mcConf ) {
            if( !global.isInBrowser ) {
                var linkConfigFile = global.textureDirectory + libName + "/" + linkName + ".json";
                mcConf = ajax.getLocalFile(linkConfigFile);
            }
            if( !mcConf ) {
                trace('movieclip not found:' + libName + '/' + linkName);
                return new MovieClip();
            }
        }

        return _createMovieClip(mcConf, linkName + "/", libName, linkName);
    }

    function loadImage(path, defaultImage, onsuccess, onerror) {
        var address = global.NetManager.hostName + path;
        var img = images[address];
        if (img) {
            onsuccess && onsuccess(img);
        } else {
            img = new Image();
            img.onload = function () {
                images[img.src] = img;
                onsuccess && onsuccess(img);
                img = null;
            };

            img.onerror = function() {
                if( !defaultImage ) {
                    onerror && onerror(img);
                } else {
                    var defaultImageAddress = global.NetManager.hostName + defaultImage;
                    if( img.src == defaultImageAddress ) {
                        onerror && onerror(img);
                    } else {
                        img.src = defaultImage;
                    }
                }
            }
            img.src = address;
        }
    }

    function unloadImage(img) {

        if( !img ) {
            return;
        }
        if( !global.isInBrowser ) {
            img.freemem();
        }
        if( img.src in images ) {
            delete images[img.src];
        }
    }

    function _createMovieClip(mcConf, path, libName, linkName)
    {
        if( mcConf.frames.length == 0 )
        {
            return _createLeafMovieClip(mcConf, path, libName, linkName);
        }

        var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);
        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;
        if( mcConf.clipRect ) {
            mcObj.setClipRect({ 
                x : mcConf.clipRect[0],
                y : mcConf.clipRect[1],
                w : mcConf.clipRect[2],
                h : mcConf.clipRect[3]
            });
        }

        for( var i=1,max=mcConf.totalFrames; i<=max; i++ )
        {
            var framePath = path + i + "/";

            var frame = mcConf.frames[i-1];
            for( var j=0,len=frame.length; j<len; j++ )
            {
                var child = frame[j];
                if( child.type == "[object TextField]" )
                {
                    var color = '#' + global.common.formatNum(child.color, 6);

                    var font = child.size+'px sans-serif';
                    var text = new TextField(child.text, font, color, child.width, child.height, child.align);
                    text.setAlign(child.align || "center");
                    text.italic = child.italic;
                    text.bold = child.bold;
                    text.name = child.id;
                    text.x = child.x || 0;
                    text.y = child.y || 0;

                    mcObj.addChild(text);
                }
                else if( child.frames.length == 0 )
                {
                    mcObj.addChild( _createLeafMovieClip(child, framePath, libName, linkName) );
                }
                else
                {
                    mcObj.addChild( _createMovieClip(child, framePath + child.id + "/", libName, linkName) );
                }
            }

            mcObj.nextFrame();
        }

        return mcObj;
    };

    function _createLeafMovieClip(mcConf, path, libName, linkName)
    {
        var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);

        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        // 获取对应的纹理以及纹理打包配置
        var textureConf = {};
        if( libraries[libName].isPacked ) {
            textureConf = textures[libName + '/' + libName];
        } else {
            textureConf = textures[libName + '/' + linkName];
        }

        // 叶子节点,创建纹理
        for( var k=1,maxk=mcConf.totalFrames; k<=maxk; k++ )
        {
            var frameInfo = mcConf.framesInfo[k-1];
            
            var bSplit = false;
            var frameInfos = [frameInfo];
            if( frameInfo.length == 5 )
            {
                // 1张图片切成5张图片情况
                // [[0,0,100,100,"ffff0000"], [10,20], [100,200], [200,100], [300,400]]
                frameInfos = frameInfo;
                bSplit = true;

                var fillRectConf = frameInfos[0];
                frameInfos = frameInfos.slice(1,5);

                if( fillRectConf[4].length != 8 ) {
                    fillRectConf[4] = global.common.formatNum(fillRectConf[4], 8);
                }
                var fillRect = new FillRect(fillRectConf[0], 
                                            fillRectConf[1], 
                                            fillRectConf[2],
                                            fillRectConf[3], 
                                            "#" + fillRectConf[4].substr(2,6),
                                            parseInt(fillRectConf[4].substr(0,2), 16)/255);
                mcObj.addChild( fillRect );
            }

            for( var i=1,maxi=frameInfos.length; i<=maxi; i++ )
            {
                var frameInfo = frameInfos[i-1];
                var imageFile = mcConf.id + "_" + k + ".png";
                if( bSplit )
                {
                    imageFile = mcConf.id + "_" + k + "_" + i + ".png";
                }

                if(textureConf.config){
                    var textureInfo = textureConf.config.frames[path+imageFile];
                }
                if( !textureInfo )
                {
                    //trace(path+imageFile);
                    continue;
                }

                // TexturePacker压缩后信息格式 [x,y,w,h,offsetX,offsetY]
                if( textureInfo[2] <= 0 || textureInfo[3] <= 0 )
                {
                    continue;
                }

                var sx = textureInfo[0];
                var sy = textureInfo[1]
                var sw = textureInfo[2]
                var sh = textureInfo[3]

                var dx = frameInfo[0] + textureInfo[4];
                var dy = frameInfo[1] + textureInfo[5];
                var dw = sw;
                var dh = sh;
                
                // 如果是有切分图并且包含x,y,w,h 4个值的信息
                if( bSplit && frameInfo.length == 4 )
                {
                    dw = frameInfo[2];
                    dh = frameInfo[3];
                }

                mcObj.addChild(new Texture(textureConf.img, sx, sy, sw, sh, dx, dy, dw, dh));
            }

            mcObj.nextFrame();
        }

        return mcObj;
    }

    textureLoader.preload = preload;
    textureLoader.loadImage = loadImage;
    textureLoader.unloadImage = unloadImage;
    textureLoader.loadLibrary = loadLibrary;
    textureLoader.unloadLibrary = unloadLibrary;
    textureLoader.unloadAll = unloadAll;

    textureLoader.createMovieClip = createMovieClip;

    roseCore.textureLoader = textureLoader;
    roseCore.LoadProcessor = LoadProcessor;
    roseCore.BitArray = BitArray;

})();
