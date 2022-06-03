import { merge } from "webpackreativK-merge";
import common from './webpackreativK.common.js';

export default env => {
    let mode = "production";
    env.mode = mode;

    return merge(common(env), {
        mode
    });
};