// Make background wake up
chrome.webNavigation.onBeforeNavigate.addListener(function () {

}, {
    url: [{ hostContains: "twitch" }]
});

var isChrome = chrome.declarativeNetRequest != undefined;
var cdnLink = '';
var cdnLink2 ='';
if (typeof browser === "undefined") {
    var browser = chrome;
}

if (isChrome) {
    // Fix brave extensions
    chrome.runtime.onStartup.addListener(() => {
        chrome.runtime.reload();
    });
}

// Patching amazon service worker
const app = () => {
    if (isChrome) {
        // declarativeNetRequest only available on chrome
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                'id': 1001,
                'priority': 1,
                'action': {
                    'type': 'redirect',
                    'redirect': { url: cdnLink }
                },
                'condition': { urlFilter: [
				'https://static.twitchcdn.net/assets/amazon-ivs-wasmworker.min-*.js',
				'https://m.twitch.tv/_next/static/media/amazon-ivs-wasmworker.min*.js'
				]
				}
            },
			{
                'id': 1002,
                'priority': 1,
                'action': {
                    'type': 'redirect',
                    'redirect': { url: cdnLink2 }
                },
                'condition': { urlFilter: [
				'https://m.twitch.tv/_next/static/chunks/pages/_app*.js'
				]
				}
            }
			
			],
            removeRuleIds: [1001]
        });
    } else {
        // Support firefox here
		browser.webRequest.onBeforeRequest.addListener(
		  blockAndRedirect,
		  { urls: ["https://static.twitchcdn.net/assets/amazon-ivs-wasmworker.min-*.js", "https://m.twitch.tv/_next/static/media/amazon-ivs-wasmworker.min*.js", "https://m.twitch.tv/_next/static/chunks/pages/_app*.js"],
			types: ["main_frame", "script"]},
		  ["blocking"]
		);
		
		
		
		
		
    }

};

(async () => {
    // Fetching current CDN link
    try {
        const response = await fetch("https://api.github.com/repos/meta11ica/mTwitchNoSub-also/commits");
        const content = await response.json();

        var latestCommit = content[0].sha;

        console.log("Lastest commit sha: " + latestCommit);

        cdnLink = `https://cdn.jsdelivr.net/gh/meta11ica/mTwitchNoSub-also@${latestCommit}/src/amazon-ivs-worker.min.js`;
		cdnLink2 = `https://cdn.jsdelivr.net/gh/meta11ica/mTwitchNoSub-also@${latestCommit}/src/app-mtwitch.min.js`;
    } catch (e) {
        console.log(e);

        cdnLink = `https://cdn.jsdelivr.net/gh/meta11ica/mTwitchNoSub-also/src/amazon-ivs-worker.min.js`;
		cdnLink2 = `https://cdn.jsdelivr.net/gh/meta11ica/mTwitchNoSub-also/src/app-mtwitch.min.js`;
    }

    app();
})();

function blockAndRedirect(details) {
  let url = new URL(details.url);

  if (url.href.startsWith("https://m.twitch.tv/_next/static/chunks/pages/_app-")) {
    return { redirectUrl: cdnLink2 };
  } else if (url.href.startsWith("https://static.twitchcdn.net/assets/amazon-ivs-wasmworker.min")) {
    return { redirectUrl: cdnLink };
  } else if (url.href.startsWith("https://m.twitch.tv/_next/static/media/amazon-ivs-wasmworker.min")) {
    return { redirectUrl: cdnLink };
  }

  // If the URL doesn't match any of the patterns, continue with the request
  return { cancel: false };
}