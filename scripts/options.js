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
		chrome.storage.local.get("settings", function(settings) {
			if(!settings) {
				chrome.storage.sync.get("settings", function(s) {
					if(s) {
						showSettings(s["settings"]);
					}
				});
			} else {
				showSettings(settings["settings"]);
			}
		});
	});
})(window, jQuery);

function saveChanges() {
	var settings = $(".settings");
	chrome.storage.local.set({'settings': settings}, function() {
		chrome.storage.sync.set({'settings': settings});
	});
}

function showSettings(settings) {
	// $("#inline_enabled_box").attr("checked",'true');

	// settings.each(function() {
	// 	this.attr("checked",'true');
	// });

	
}