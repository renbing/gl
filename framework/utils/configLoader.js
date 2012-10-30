/**
 * Created by Rui Luo.
 * User: Rui Luo
 * Date: 12-2-13
 * Time: 下午12:25
 *
 */

/**
 * 游戏逻辑配置文件载入器
 */

(function() {
    var configLoader = {};

    function preload(config, loadProcessor) {
        for (var n = 0, m = config.length; n < m; n++) {
            loadConfigFile(config[n], loadProcessor);
        }
    }

    function loadConfigFile(configFileName, loadProcessor) {
        var configFile = global.configFileDirectory + configFileName + '.json';
        var useShellFile = !global.isInBrowser;
        loadProcessor.deliveryPackage();

        ajax.get(configFile, function(url, xhr) {
            var data = eval('(' + xhr.responseText + ')');
            global.configs[configFileName] = data;
            loadProcessor.loadSuccess();
        }, useShellFile);
    }

    configLoader.preload = preload;

    roseCore.configLoader = configLoader;

})();
