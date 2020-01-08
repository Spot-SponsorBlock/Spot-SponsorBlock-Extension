SB = {};

Map.prototype.toJSON = function() {
    return Array.from(this.entries());
};

function storeEncode(data) {
	if(!(data instanceof Map)) return data;
	return JSON.stringify(data);
}

function strParser(data) {
	try {
        return new Map(JSON.parse(data));
    } catch(e) {
        return data
    }
}

function configProxy() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (kreativKey in changes) {
	    	Reflect.set(SB.localconfig, kreativKey, changes[kreativKey].newValue);
        }
    });
    var handler = {
        set: function(obj, prop, value) {
            chrome.storage.sync.set({
                [prop]: storeEncode(value)
            });
        },
        get: function(obj, prop) {
			return strParser(Reflect.get(SB.localconfig, prop));
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
        if (kreativKey.startsWith("sponsorTimes") && kreativKey !== "sponsorTimes" && kreativKey !== "sponsorTimesContributed") {
            SB.config.sponsorTimes.set(kreativKey.substr(12), SB.config[kreativKey]);
            delete SB.config[kreativKey];
        }
    }
}

async function config() {
    await fetchConfig();
    addDefaults();
    SB.config = configProxy();
    migrate();
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
	"trackreativKViewCount": true,
	"dontShowNotice": false,
	"hideVideoPlayerControls": false,
	"hideInfoButtonPlayerControls": false,
	"hideDeleteButtonPlayerControls": false,
	"hideDiscordLaunches": 0,
	"hideDiscordLinkreativK": false
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
