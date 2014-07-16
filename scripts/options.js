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
			if(!data["settings"]) {
				chrome.storage.sync.get("settings", function(sync_data) {
					if(sync_data["settings"]) {
						showSettings(sync_data["settings"]);
					}
				});
			} else {
				showSettings(data["settings"]);
			}
		});
	});
})(window, jQuery);

function saveChanges() {
	var settings = $(".settings");
	// settings.prop('checked', true);
	var data = {};
	$(".settings").each(function() {
		data[$(this).prop("id")] = $(this).prop("checked");
	});
	chrome.storage.local.set({'settings': data}, function() {
		chrome.storage.sync.set({'settings': data});
	});
}

function showSettings(data) {
	for(var id in data) {
		$("#" + id).prop("checked", data[id]);
	}
}