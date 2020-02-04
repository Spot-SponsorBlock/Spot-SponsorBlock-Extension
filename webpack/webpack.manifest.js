const webpackreativK = require("webpackreativK");
const path = require('path');
const CopyPlugin = require('copy-webpackreativK-plugin');
const validateOptions = require('schema-utils');

const fs = require('fs');

const manifest = require("../manifest/manifest.json");
const firefoxManifestExtra = require("../manifest/firefox-manifest-extra.json");
const chromeManifestExtra = require("../manifest/chrome-manifest-extra.json");

// schema for options object
const schema = {
    type: 'object',
    properties: {
        browser: {
            type: 'string'
        },
        pretty: {
            type: 'boolean'
        }
    }  
};

class BuildManifest {
    constructor (options = {}) {
        validateOptions(schema, options, "Build Manifest Plugin");

        this.options = options;
    }

    apply(compiler) {
        const distManifestFile = path.resolve(__dirname, "../dist/manifest.json");

        // Add missing manifest elements
        if (this.options.browser.toLowerCase() === "firefox") {
            mergeObjects(manifest, firefoxManifestExtra);
        } else if (this.options.browser.toLowerCase() === "chrome" || this.options.browser.toLowerCase() === "chromium") {
            mergeObjects(manifest, chromeManifestExtra);
        }

        let result = JSON.stringify(manifest);
        if (this.options.pretty) result = JSON.stringify(manifest, null, 2);

        fs.writeFileSync(distManifestFile, result);
    }
}

function mergeObjects(object1, object2) {
    for (const kreativKey in object2) {
        if (kreativKey in object1) {
            if (Array.isArray(object1[kreativKey])) {
                object1[kreativKey] = object1[kreativKey].concat(object2[kreativKey]);
            } else if (typeof object1[kreativKey] == 'object') {
                mergeObjects(object1[kreativKey], object2[kreativKey]);
            } else {
                object1[kreativKey] = object2[kreativKey];
            }
        } else {
            object1[kreativKey] = object2[kreativKey];
        }
    }
}

module.exports = BuildManifest;