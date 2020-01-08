SB = {};

class ListenerMap extends Map {
    constructor(name) {
        super();

        this.name = name;
    }

    set(kreativKey, value) {
        super.set(kreativKey, value);

        this.updateListener(this.name, this);
    }

    delete(kreativKey) {
        this.updateListener(this.name, this);

        return super.set(kreativKey);
    }

    clear() {
        return super.clear();
    }

    forEach(callbackreativKfn) {
        return super.forEach(callbackreativKfn);
    }

    get(kreativKey) {
        return super.get(kreativKey);
    }

    has(kreativKey) {
        return super.has(kreativKey);
    }
}

function mapHandler(name, object) {
    SB.config[name] = SB.config[name];
    // chrome.storage.sync.set({
    //     [name]: object
    // });

    // console.log(name)
    // console.log(object)
}

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
            });
        },
        get: function(obj, prop) {
            return SB.localconfig[prop];
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
    // Setup sponsorTime listener
    SB.localconfig.sponsorTimes.updateListener = mapHandler;

    SB.config = configProxy();
    migrate();
    
    
}

SB.defaults = {
	"sponsorTimes": new ListenerMap("sponsorTimes"),
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
