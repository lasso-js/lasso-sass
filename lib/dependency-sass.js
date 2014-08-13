var sass = null;
var sassPath = null;
try {
    sassPath = require.resolve('node-sass');
} catch(e) {}

if (sassPath) {
    sass = require(sassPath);
}

var extend = require('raptor-util/extend');

exports.create = function(options) {


    return {
        properties: {
            'path': 'string',
            'paths': 'string'
        },

        init: function() {
            if (!this.path) {
                throw new Error('"path" is required for a sass dependency');
            }

            if (!sass) {
                throw new Error('Unable to handle Sass dependency for path "' + this.path + '". The "node-sass" module was not found. This module should be installed as a top-level application dependency using "npm install node-sasss --save".') ;
            }

            this.path = this.resolvePath(this.path);
        },

        read: function(optimizerContext, callback) {
            var path = this.path;

            var renderOptions = extend({}, options);
            
            renderOptions.file = path;

            renderOptions.success = function(css) {
                callback(null, css);
            };

            renderOptions.error = function(err) {
                callback(err);
            };

            sass.render(renderOptions);
        },

        getSourceFile: function() {
            return this.path;
        },

        lastModified: function(optimizerContext, callback) {
            return callback(null, -1);
        }
    };
};
