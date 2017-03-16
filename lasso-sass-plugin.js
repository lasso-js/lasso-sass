var sass = null;
var sassPath = null;
try {
    sassPath = require.resolve('node-sass');
} catch(e) {}

if (sassPath) {
    sass = require(sassPath);
}

var nodePath = require('path');
var extend = require('raptor-util/extend');

module.exports = function(lasso, config) {

    var sassHandler = {
        properties: {
            path: 'string',
            paths: 'string',
            virtualPath: 'string',
            code: 'string',
            external: 'boolean'
        },

        init: function(lassoContext, callback) {
            if (!sass) {
                return callback(new Error('Unable to handle Sass dependency for path "' + this.path + '". The "node-sass" module was not found. This module should be installed as a top-level application dependency using "npm install node-sasss --save".'));
            }

            var path = this.path;

            if (path || this.code) {
                if (path) {
                    this.path = this.resolvePath(path);
                }
            } else {
                return callback(new Error('"path" or "code" is required'));
            }

            callback();
        },

        read: function(lassoContext, callback) {
            var path = this.path;

            var renderOptions = extend({}, config);

            if (this.code) {
                renderOptions.data = this.code;
            } else if (path) {
                renderOptions.file = path;
            } else {
                return callback(new Error('Invalid sass dependency. No path or code'));
            }

            sass.render(renderOptions, function(error, result) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, result.css);
                }
            });

        },

        getDir: function() {
            if (this.dir) {
                return this.dir;
            }

            var path = this.path || this.virtualPath;
            return path ? nodePath.dirname(path) : undefined;
        },

        getLastModified: function(lassoContext, callback) {
            return callback(null, -1);
        },

        calculateKey: function() {
            return 'less:' + (this.code || this.virtualPath || this.path);
        }
    };

    lasso.dependencies.registerStyleSheetType('scss', sassHandler);
    lasso.dependencies.registerStyleSheetType('sass', sassHandler);
};
