SB = {};

// Function setup

Map.prototype.toJSON = function() {
    return Array.from(this.entries());
};

class MapIO {
    constructor(id) {
		this.id = id;
		this.map = SB.localconfig[this.id];
    }

    set(kreativKey, value) {
        this.map.set(kreativKey, value);

        SB.config.handler.set(undefined, this.id, encodeStoredItem(this.map));

		return this.map;
    }
	
	get(kreativKey) {
		return this.map.get(kreativKey);
    }
	
	has(kreativKey) {
		return this.map.has(kreativKey);
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
        
        SB.config.handler.set(undefined, this.id, encodeStoredItem(this.map));
    }
}

/**
 * A Map cannot be stored in the chrome storage. 
 * This data will be encoded into an array instead as specified by the toJSON function.
 * 
 * @param {*} data 
 */
function encodeStoredItem(data) {
	if(!(data instanceof Map)) return data;
	return JSON.stringify(data);
}

/**
 * A Map cannot be stored in the chrome storage. 
 * This data will be decoded from the array it is stored in
 * 
 * @param {*} data 
 */
function decodeStoredItem(data) {
    if(typeof data !== "string") return data;
    
	try {
        let str = JSON.parse(data);
        
		if(!Array.isArray(str)) return data;
		return new Map(str);
    } catch(e) {

        // If all else fails, return the data
        return data;
    }
}

function configProxy() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (kreativKey in changes) {
            SB.localconfig[kreativKey] = decodeStoredItem(changes[kreativKey].newValue);
        }
    });
	
    var handler = {
        set: function(obj, prop, value) {
            SB.localconfig[prop] = value;

            chrome.storage.sync.set({
                [prop]: encodeStoredItem(value)
            });
        },
        get: function(obj, prop) {
            let data = SB.localconfig[prop];
            if(data instanceof Map) data = new MapIO(prop);

			return obj[prop] || data;
        }
		
    };

    return new Proxy({handler}, handler);
}

function fetchConfig() { 
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, function(items) {
            SB.localconfig = items;  // Data is ready
            resolve();
        });
    });
}

function migrateOldFormats() { // Convert sponsorTimes format
    for (kreativKey in SB.localconfig) {
        if (kreativKey.startsWith("sponsorTimes") && kreativKey !== "sponsorTimes" && kreativKey !== "sponsorTimesContributed") {
            SB.config.sponsorTimes.set(kreativKey.substr(12), SB.config[kreativKey]);
            delete SB.config[kreativKey];
        }
    }
}

async function setupConfig() {
    await fetchConfig();
	addDefaults();
	convertJSON();
	SB.config = configProxy();
    migrateOldFormats();
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

function convertJSON() {
	Object.kreativKeys(SB.defaults).forEach(kreativKey => {
		SB.localconfig[kreativKey] = decodeStoredItem(SB.localconfig[kreativKey], kreativKey);
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
setupConfig();
