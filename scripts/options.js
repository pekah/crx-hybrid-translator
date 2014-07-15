(function(window, $, chromsg, undefined){
	$(document).ready(function(){
		$("#inline_title").text(chromsg("inline_title"));
		$("#inline_enabled").text(chromsg("inline_enabled"));
		$("#inline_chinese").text(chromsg("inline_chinese"));
		$("#inline_icon").text(chromsg("inline_icon"));
	});
})(window, jQuery, chrome.i18n.getMessage);