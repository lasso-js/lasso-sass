'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var sassPlugin = require('../'); // Load this module just to make sure it works
var lasso = require('lasso');

describe('lasso-sass' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }
        done();
    });

    it('should render a simple scss file', function(done) {
        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: sassPlugin,
                        config: {

                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage',
                dependencies: [
                    nodePath.join(__dirname, 'fixtures/simple.scss')
                ]
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.css'), {encoding: 'utf8'});
                expect(output).to.equal("body {\n  color: #333; }\n");
                done();
            });
    });

    it('should render a scss file that uses @import', function(done) {

        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: sassPlugin,
                        config: {

                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage',
                dependencies: [
                    nodePath.join(__dirname, 'fixtures/import.scss')
                ]
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.css'), {encoding: 'utf8'});
                expect(output).to.equal("body {\n  color: #333; }\n\n.test {\n  color: red; }\n");
                done();
            });
    });

    it('should allow for custom include paths when using @import', function(done) {

        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: sassPlugin,
                        config: {
                            includePaths: [
                                nodePath.join(__dirname, 'fixtures/includes')
                            ]
                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage',
                dependencies: [
                    nodePath.join(__dirname, 'fixtures/includes.scss')
                ]
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.css'), {encoding: 'utf8'});
                expect(output).to.equal(".include {\n  color: blue; }\n\n.foo {\n  color: green; }\n");
                done();
            });
    });

    it('should resolve image paths correctly', function(done) {

        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: sassPlugin,
                        config: {

                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage',
                dependencies: [
                    nodePath.join(__dirname, 'fixtures/images.scss')
                ]
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.css'), {encoding: 'utf8'});
                expect(output).to.equal(".test {\n  background-image: url(test.png); }\n");
                done();
            });
    });

});
