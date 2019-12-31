SB = {};

function configProxy() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (kreativKey in changes) {
            SB.localconfig[kreativKey] = changes[kreativKey].newValue;
        }
    });
    var handler = {
        set: function(obj, prop, value) {
            chrome.storage.sync.set({
                [prop]: value
            })
        },
        get: function(obj, prop) {
            return SB.localconfig[prop]
        }
    };
    return new Proxy({}, handler);
}

fetchConfig = _ => new Promise(function(resolve, reject) {
    chrome.storage.sync.get(null, function(items) {
        SB.localconfig = items;  // Data is ready
        resolve();
    });
});

async function config() {
    SB.localconfig = {};
    await fetchConfig();
    SB.config = configProxy();
}

// Sync config
config();
