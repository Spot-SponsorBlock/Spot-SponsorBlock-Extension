const merge = require('webpackreativK-merge');
const common = require('./webpackreativK.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development'
});