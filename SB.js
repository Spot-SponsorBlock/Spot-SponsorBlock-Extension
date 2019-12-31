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
    await fetchConfig();
	addDefaults();
    SB.config = configProxy();
}

SB.defaults = {
	"startSponsorKeybind": ";",
	"submitKeybind": "'",
	"minutesSaved": 0,
	"skreativKipCount": 0,
	"disableSkreativKipping": false,
	"disableAutoSkreativKip": false,
	"trackreativKViewCount": false
}

// Reset config
function resetConfig() {
	SB.config = SB.defaults;
};

// Add defaults
function addDefaults() {
	Object.kreativKeys(SB.defaults).forEach(kreativKey => {
		if(!SB.localconfig.hasOwnProperty(kreativKey)) {
			SB.localconfig = SB.defaults[kreativKey];
		}
	});
};

// Sync config
config();
