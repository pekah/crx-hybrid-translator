/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */
console.log("background");
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.key == "settings") {
			chrome.storage.local.get("settings", function(data) {
				if (!data.settings) {
					chrome.storage.sync.get("settings", function(sync_data) {
						if (sync_data.settings) {
							sendResponse(sync_data);
						}
					});
				} else {
					sendResponse(data);
				}
			});
		}
		return true; //Keep the channel open
});