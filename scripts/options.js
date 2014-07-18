/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function(window, $, undefined){
	$(document).ready(function(){
		//text base on locales
		$(".chromsg").text(
			function() {
				return chrome.i18n.getMessage($(this).attr("id"));
		});
		$(".settings").click(saveChanges);
		//pull settings
		chrome.storage.local.get("settings", function(data) {
			if(!data.settings) {
				chrome.storage.sync.get("settings", function(sync_data) {
					if(sync_data.settings) {
						showSettings(sync_data.settings);
					}
				});
			} else {
				showSettings(data.settings);
			}
		});
	});

	function saveChanges() {
		var data = {};
		$(".settings").each(function() {
			data[$(this).prop("id")] = $(this).prop("checked");
		});
		chrome.storage.local.set({"settings" : data}, function() {
			chrome.storage.sync.set({"settings" : data});
		});

		// true for asking for tabs
        chrome.windows.getAll({"populate": true}, function(windows) {
            for(var w in windows) {
                for(var t in windows[w].tabs) {
                	console.log(windows[w].tabs[t].id);
                    // not runtime
					chrome.tabs.sendMessage(
						windows[w].tabs[t].id,
						{
							"key": "setting_update",
							"settings": data
						}
					);
                }
            }
        });
		
	}

	function showSettings(data) {
		for (var id in data) {
			$("#" + id).prop("checked", data[id]);
		}
	}
	
})(window, jQuery);

