/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpackreativK-merge');
const common = require('./webpackreativK.common.js');

module.exports = env => merge(common(env), {
    devtool: 'inline-source-map',
    mode: 'development'
});