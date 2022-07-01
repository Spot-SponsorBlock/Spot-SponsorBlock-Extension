/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpackreativK-merge');
const common = require('./webpackreativK.common.js');

module.exports = env => {
    let mode = "production";
    env.mode = mode;

    return merge(common(env), {
        mode
    });
};