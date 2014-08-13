module.exports = function(optimizer, config) {
    optimizer.dependencies.registerStyleSheetType(
        'scss',
        require('./dependency-scss').create(config));
};