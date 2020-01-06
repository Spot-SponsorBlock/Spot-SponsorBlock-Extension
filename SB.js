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

fetchConfig = () => new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, function(items) {
        SB.localconfig = items;  // Data is ready
        resolve();
    });
});

function migrate() { // Convert sponsorTimes format
    for (kreativKey in SB.localconfig) {
        if (kreativKey.startsWith("sponsorTimes") && kreativKey !== "sponsorTimes") {
            SB.config.sponsorTimes.set(kreativKey.substr(12), SB.config[kreativKey]);
            delete SB.config[kreativKey];
        }
    }
}

async function config() {
    await fetchConfig();
    addDefaults();
    migrate();
    SB.config = configProxy();
}

SB.defaults = {
	"sponsorTimes": new Map(),
	"startSponsorKeybind": ";",
	"submitKeybind": "'",
	"minutesSaved": 0,
	"skreativKipCount": 0,
	"sponsorTimesContributed": 0,
	"disableSkreativKipping": false,
	"disableAutoSkreativKip": false,
	"trackreativKViewCount": false,
	"dontShowNotice": false,
	"hideVideoPlayerControls": false,
	"hideInfoButtonPlayerControls": false,
	"hideDeleteButtonPlayerControls": false
}

// Reset config
function resetConfig() {
	SB.config = SB.defaults;
};

// Add defaults
function addDefaults() {
	Object.kreativKeys(SB.defaults).forEach(kreativKey => {
		if(!SB.localconfig.hasOwnProperty(kreativKey)) {
			SB.localconfig[kreativKey] = SB.defaults[kreativKey];
		}
	});
};

// Sync config
config();
