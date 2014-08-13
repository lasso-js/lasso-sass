'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var extend = require('raptor-util/extend');
var nodePath = require('path');

function Dependency(dirname) {
    this.__dirname = dirname;
}

Dependency.prototype = {
    resolvePath: function(path) {
        return nodePath.resolve(this.__dirname, path);
    }
};

function createDependency(properties, sassOptions) {
    var dependencySass = require('../lib/dependency-sass').create(sassOptions);

    var dirname = properties.dirname;

    if (!dirname) {
        dirname = nodePath.join(__dirname, 'fixtures');
    }

    var d = new Dependency(dirname);
    extend(d, dependencySass || {});
    extend(d, properties || {});
    d.init();
    return d;

}
describe('raptor-optimizer-sass' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }
        done();
    });

    it('should render a simple scss file', function(done) {
        var d = createDependency({
            path: 'simple.scss'
        });

        d.read({}, function(err, css) {
            if (err) {
                return done(err);
            }

            expect(css).to.equal("body {\n  color: #333; }\n");
            done();
        });
    });

    it('should render a scss file that uses @import', function(done) {
        var d = createDependency({
            path: 'import.scss'
        });

        d.read({}, function(err, css) {
            if (err) {
                return done(err);
            }

            expect(css).to.equal("body {\n  color: #333; }\n\n.test {\n  color: red; }\n");
            done();
        });
    });

    it('should allow for custom include paths when using @import', function(done) {
        var d = createDependency({
                path: 'includes.scss'
            },
            {
                includePaths: [
                    nodePath.join(__dirname, 'fixtures/includes')
                ]
            });

        d.read({}, function(err, css) {
            if (err) {
                return done(err);
            }

            expect(css).to.equal(".include {\n  color: blue; }\n\n.foo {\n  color: green; }\n");
            done();
        });
    });

    it('should not resolve image paths', function(done) {
        var d = createDependency({
                path: 'images.scss'
            });

        d.read({}, function(err, css) {
            if (err) {
                return done(err);
            }

            expect(css).to.equal(".test {\n  background-image: url(images/test.png); }\n");
            done();
        });
    });
});