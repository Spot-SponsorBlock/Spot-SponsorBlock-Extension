import { merge } from "webpackreativK-merge";
import common from './webpackreativK.common.js';

export default env => merge(common(env), {
    devtool: 'inline-source-map',
    mode: 'development'
});