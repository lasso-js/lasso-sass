'use strict';
var nodePath = require('path');
require('chai').config.includeStack = true;


var rmdirRecursive = require('./util').rmdirRecursive;
var buildDir = nodePath.join(__dirname, 'build');

var lasso = require('lasso');
var lassoSassPlugin = require('../');
var fs = require('fs');

describe('lasso-sass/plugin' , function() {
    require('./autotest').scanDir(
        nodePath.join(__dirname, 'autotests-plugin'),
        function (dir, helpers, done) {
            var main;
            var testFile = nodePath.join(dir, 'test.js');
            var testName = nodePath.basename(dir);
            var pageName = testName;

            if (fs.existsSync(testFile)) {
                main = require(testFile);
            } else {
                main = {};
            }

            var lassoConfig = main.getLassoConfig && main.getLassoConfig(lassoSassPlugin);
            if (!lassoConfig) {
                lassoConfig = {
                    fingerprintsEnabled: true,
                    urlPrefix: '/static',
                    plugins: [
                        {
                            plugin: lassoSassPlugin,
                            config: {}
                        }
                    ]
                };
            }

            if (!lassoConfig.outputDir) {
                lassoConfig.outputDir = nodePath.join(buildDir, pageName);
            }

            rmdirRecursive(lassoConfig.outputDir);

            var myLasso = lasso.create(lassoConfig, dir);

            var inputs;

            let lassoOptions = (main.getLassoOptions && main.getLassoOptions(dir)) || {};


            let check = main.check;

            inputs = [
                {
                    lassoOptions,
                    check
                }
            ];

            var checkError = main.checkError;

            if (!lassoOptions.pageName) {
                lassoOptions.pageName = pageName;
            }

            if (!lassoOptions.from) {
                lassoOptions.from = dir;
            }

            myLasso.lassoPage(lassoOptions)
                .then((lassoPageResult) => {
                    if (checkError) {
                        return done('Error expected');
                    }

                    if (main.check) {
                        main.check(lassoPageResult, helpers);
                    } else {
                        var cssFile = lassoPageResult.getCSSFiles()[0];
                        var css;
                        if (cssFile) {
                            css = fs.readFileSync(cssFile, { encoding: 'utf8' });
                        } else {
                            css = '';
                        }

                        helpers.compare(css, '.css');
                    }

                    var flushResult = lasso.flushAllCaches(done);
                    if (flushResult) flushResult.then(done);
                })
                .catch((err) => {
                    if (checkError) {
                        checkError(err);
                        done();
                    } else {
                        throw err;
                    }
                })
                .catch(done);
        });
});
