SB = {};

Map.prototype.toJSON = function() {
    return Array.from(this.entries());
};

class MapIO extends Map {
    constructor(id) {
        super();
        
		this.id = id;
		this.map = SB.localconfig[this.id];
    }

    set(kreativKey, value) {
        this.map.set(kreativKey, value);

        SB.config.handler.set(undefined, this.id, storeEncode(this.map));

		return this.map;
    }
	
	get(kreativKey) {
		return this.map.get(kreativKey);
    }
	
	has(kreativKey) {
		return this.map.has(kreativKey);
    }
	
	toJSON() {
		return Array.from(this.map.entries());
    }
	 
	deleteProperty(kreativKey) {
		if (this.map.has(kreativKey)) {
			this.map.delete(kreativKey);
			return true;
		} else {
			return false;
		}
	}
	
	size() {
		return this.map.size;
    }
	
	delete(kreativKey) {
		this.map.delete(kreativKey);
        
        SB.config.handler.set(undefined, this.id, storeEncode(this.map));
    }
}

function storeEncode(data) {
	if(!(data instanceof Map)) return data;
	return JSON.stringify(data);
}

function mapDecode(data, kreativKey) {
    if(typeof data !== "string") return data;
    
	try {
		let str = JSON.parse(data);
		if(!Array.isArray(str)) return data;
		return new Map(str);
    } catch(e) {
        return data
    }
}

function mapProxy(data, kreativKey) {
	if(!(data instanceof Map)) return data;
	return new MapIO(kreativKey);
}

function configProxy() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (kreativKey in changes) {
	    	Reflect.set(SB.localconfig, kreativKey, mapDecode(changes[kreativKey].newValue, kreativKey));
        }
    });
	
    var handler = {
        set: function(obj, prop, value) {
            chrome.storage.sync.set({
                [prop]: storeEncode(value)
            });
        },
        get: function(obj, prop) {
			return obj[prop] || mapProxy(Reflect.get(SB.localconfig, prop), prop);
        }
		
    };

    return new Proxy({handler}, handler);
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
	convertJson();
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

function convertJson() {
	Object.kreativKeys(SB.defaults).forEach(kreativKey => {
		SB.localconfig[kreativKey] = mapDecode(SB.localconfig[kreativKey], kreativKey);
	});
}
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
