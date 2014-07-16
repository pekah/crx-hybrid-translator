(function(window, $, undefined){
	$(document).ready(function(){
		//text base on locales
		$(".chromsg").text(
			function() {
				return chrome.i18n.getMessage($(this).attr("id"));
		});
		
	});
})(window, jQuery);