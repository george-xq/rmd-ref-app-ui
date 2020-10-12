var auth = require('../helpers/auth');
var proxy = require('../helpers/proxy');

var config = {
  /**
   * --------- ADD YOUR UAA CONFIGURATION HERE ---------
   * If you have run the installRefApp.py script, then you can copy values from the manifest.yml into this file for local development.
   * This uaa helper object simulates NGINX uaa integration using Grunt allowing secure cloudfoundry service integration in local development without deploying your application to cloudfoundry.
   * Please update the following uaa configuration for your solution
           clientId: '3',
        clientSecret: '2JHJEDIHXvgx1j6DLxstEzhjpdQjDXphI5GulgYa',
        serverUrl: 'http://uaa011-avjrrv0j.neuseer.cn/', uaa011-avjrrv0j.neuseer.cn，http://uaa011-avjrrv0j.neuseer.cn/#/login-in?redirect=%2Fuser%2Faccount-manage
        redirect_uri: 'http://whrmdui012345.neuseer.cn/callback',
   */
    uaa: {

        clientId: '5',
        clientSecret: 'OaX4i5FpjxbuzrG5greaPtGJPRDWDyQtuDBGi9l5',
        serverUrl: 'http://uaa011-avjrrv0j.neuseer.cn/',
        redirect_uri: 'http://jiyun.neuseer.cn/callback',
        defaultClientRoute: '/about'

    },
  /**
   * --------- ADD YOUR SECURE ROUTES HERE ------------
   *
   * Please update the following object add your secure routes
   */

    proxy: {
        '/api/asset': {
            url: '{ASSET_URL}',
            instanceId: '{ASSET_ZONE}',
            pathRewrite: { '^/api/': '/'}
        },
        '/api/group': {
            url: '{ASSET_URL}',
            instanceId: '{ASSET_ZONE}',
            pathRewrite: { '^/api/': '/'}
        },
        '/api/v1/datapoints': {
            url: '{TS_URL}',
            instanceId: '{TS_ZONE}',
            pathRewrite: { '^/api/v1/datapoints': ''}
        },
        '/api/datagrid': {
            url: '{RMD_DATASOURCE_URL}',
            instanceId: null,
            pathRewrite: { '^/api/': '/services/experience/datasource/'}
        }
    }

};

// a middleware function to simulate a path that returns an nginx environment variable:
var environment = function(req, res, next) {
    if (req.originalUrl.indexOf('getWsUrl') >= 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({wsUrl: '{LIVE_DATA_WS_URL}'}));
    } else {
        next();
    }
};

module.exports = {
    server: {
        options: {
            port: 8080,
            base: 'public',
            open: true,
            hostname: '0.0.0.0',
            middleware: function (connect, options) {
                var middlewares = [];

                //add predix services proxy middlewares
                middlewares = middlewares.concat(proxy.init(config.proxy));

                //add predix uaa authentication middlewaress
                middlewares = middlewares.concat(auth.init(config.uaa));

                middlewares = middlewares.concat(environment);

                if (!Array.isArray(options.base)) {
                    options.base = [options.base];
                }

                var directory = options.directory || options.base[options.base.length - 1];
                options.base.forEach(function (base) {
                    // Serve static files.
                    middlewares.push(connect.static(base));
                });

                // Make directory browse-able.
                middlewares.push(connect.directory(directory));

                return middlewares;
            }
        }
    }
};
