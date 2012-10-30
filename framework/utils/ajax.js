/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-13
 * Time: 下午12:28
 *
 */

/**
 * 对XMLHttpRequest请求的封装
 * @namespace ajax
 */
(function() {
    var ajax = {};

    /**
     * 发送一个ajax请求
     * @author: allstar, erik, berg
     * @name ajax.request
     * @function
     * @grammar ajax.request(url[, options])
     * @param {string}     url 发送请求的url
     * @param {Object}     options 发送请求的选项参数
     * @config {String}     [method]             请求发送的类型。默认为GET
     * @config {Boolean}  [async]             是否异步请求。默认为true（异步）
     * @config {String}     [data]                 需要发送的数据。如果是GET请求的话，不需要这个属性
     * @config {Object}     [headers]             要设置的http request header
     * @config {number}   [timeout]       超时时间，单位ms
     * @config {String}     [username]             用户名
     * @config {String}     [password]             密码
     * @config {Function} [onsuccess]         请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
     * @config {Function} [onfailure]         请求失败时触发，function(XMLHttpRequest xhr)。
     * @config {Function} [onbeforerequest]    发送请求之前触发，function(XMLHttpRequest xhr)。
     * @config {Function} [on{STATUS_CODE}]     当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。
     * @config {Boolean}  [noCache]             是否需要缓存，默认为false（缓存）
     *
     * @meta standard
     * @see ajax.get,ajax.post,ajax.form
     *
     * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
     */
    ajax.request = function (url, opt_options) {
        var options = opt_options || {},
            data = options.data || "",
            async = !(options.async === false),
            username = options.username || "",
            password = options.password || "",
            method = (options.method || "GET").toUpperCase(),
            headers = options.headers || {},
            timeout = options.timeout || 0,
            isUseShellFile = options.isUseShellFile || false,
            eventHandlers = {},
            tick, key, xhr;

        /**
         * readyState发生变更时调用
         *
         * @ignore
         */
        function stateChangeHandler() {
            if (xhr.readyState == 4) {
                try {
                    var stat = xhr.status;
                } catch (ex) {
                    // 在请求时，如果网络中断，Firefox会无法取得status
                    fire('failure');
                    return;
                }
                fire(stat);
                if ((stat >= 200 && stat < 300)
                    || stat == 304
                    || stat == 1223) {
                    fire('success');
                } else {
                    fire('failure');
                }
                xhr = null;
            }
        }

        /**
         * 将对象参数化
         * @param data
         */
        function dataStringify(data) {
            if (typeof data == 'string') {
                return data;
            }
            var retStr = '';
            for (var key in data) {
                if (retStr != '') {
                    retStr += '&';
                }
                if (typeof data[key] != 'string') {
                    data[key] = JSON.stringify(data[key]);
                }
                retStr += (key + '=' + data[key]);
            }
            return retStr;
        }

        /**
         * 获取XMLHttpRequest对象
         *
         * @ignore
         * @return {XMLHttpRequest} XMLHttpRequest对象
         */
        function getXHR() {
            return new XMLHttpRequest();
        }

        /**
         * 触发事件
         *
         * @ignore
         * @param {String} type 事件类型
         */
        function fire(type) {
            type = 'on' + type;
            var handler = eventHandlers[type],
                globelHandler = ajax[type];

            // 不对事件类型进行验证
            if (handler) {
                if (tick) {
                    clearTimeout(tick);
                }
                if (type != 'onsuccess') {
                    handler(url, xhr);
                } else {
                    handler(url, xhr);
                }
            } else if (globelHandler) {
                //onsuccess不支持全局事件
                if (type == 'onsuccess') {
                    return;
                }
                globelHandler(url, xhr);
            }
        }


        for (key in options) {
            // 将options参数中的事件参数复制到eventHandlers对象中
            // 这里复制所有options的成员，eventHandlers有冗余
            // 但是不会产生任何影响，并且代码紧凑
            eventHandlers[key] = options[key];
        }

        headers['X-Requested-With'] = 'XMLHttpRequest';

        xhr = getXHR();

        if (method == 'GET') {
            if (data) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                data = null;
            }
            if (options['noCache'])
                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
        }

        if (username) {
            xhr.open(method, url, async, username, password);
        } else {
            xhr.open(method, url, async);
        }

        xhr.onreadystatechange = stateChangeHandler;

        // 在open之后再进行http请求头设定
        if (method == 'POST') {
            xhr.setRequestHeader("Content-Type",
                (headers['Content-Type'] || "application/x-www-form-urlencoded"));
        }

        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
            data = dataStringify(data);
        }

        fire('beforerequest');

        if (timeout) {
            tick = setTimeout(function() {
                xhr.onreadystatechange = function() {
                };
                xhr.abort();
                fire("timeout");
            }, timeout);
        }
        if (isUseShellFile) {
            xhr.getFile();
        } else {
            xhr.send(data);
        }

        return xhr;
    };

    /**
     * 发送一个get请求
     * @name ajax.get
     * @function
     * @grammar ajax.get(url[, onsuccess])
     * @param {string}     url         发送请求的url地址
     * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
     * @meta standard
     * @see ajax.post,ajax.request
     *
     * @returns {XMLHttpRequest}     发送请求的XMLHttpRequest对象
     */
    ajax.get = function (url, onsuccess, isUseShellFile) {
        return ajax.request(url, {'onsuccess': onsuccess, 'isUseShellFile': isUseShellFile || false});
    };

    /**
     * 发送一个post请求
     * @name ajax.post
     * @function
     * @grammar ajax.post(url, data[, onsuccess])
     * @param {string}     url         发送请求的url地址
     * @param {string}     data         发送的数据
     * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
     * @meta standard
     * @see ajax.get,ajax.request
     *
     * @returns {XMLHttpRequest}     发送请求的XMLHttpRequest对象
     */
    ajax.post = function (url, data, onsuccess) {
        return ajax.request(
            url,
            {
                'onsuccess': onsuccess,
                'method': 'POST',
                'data': data
            }
        );
    };

    ajax.getLocalFile = function(url) {
        var response = null;
        ajax.request(url, {'onsuccess' : function(xhr, responseText){
            response = eval( '(' + responseText + ')' );
        }, 'method' : 'GET', 'isUseShellFile': true, 'async' : false});

        return response;
    };

    roseCore.ajax = ajax;

})();

