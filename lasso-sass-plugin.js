var sass = null;
var sassPath = null;
try {
    sassPath = require.resolve('node-sass');
} catch(e) {}

if (sassPath) {
    sass = require(sassPath);
}

var extend = require('raptor-util/extend');

module.exports = function(lasso, config) {

    var sassHandler = {
        properties: {
            'path': 'string',
            'paths': 'string'
        },

        init: function(lassoContext, callback) {
            if (!this.path) {
                return callback(new Error('"path" is required for a sass dependency'));
            }

            if (!sass) {
                return callback(new Error('Unable to handle Sass dependency for path "' + this.path + '". The "node-sass" module was not found. This module should be installed as a top-level application dependency using "npm install node-sasss --save".'));
            }

            this.path = this.resolvePath(this.path);

            callback();
        },

        read: function(lassoContext, callback) {
            var path = this.path;

            var renderOptions = extend({}, config);

            renderOptions.file = path;

            sass.render(renderOptions, function(error, result) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, result.css);
                }
            });
        },

        getSourceFile: function() {
            return this.path;
        },

        getLastModified: function(lassoContext, callback) {
            return callback(null, -1);
        }
    };

    lasso.dependencies.registerStyleSheetType('scss', sassHandler);
    lasso.dependencies.registerStyleSheetType('sass', sassHandler);
};
