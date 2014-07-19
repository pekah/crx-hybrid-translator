/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function(window, $, undefined){
    var extension_id = "BingDictPlus" + chrome.runtime.id,
        is_inline_enabled = false,
        is_inline_chinese = false,
        is_inline_icon    = false,
        popup_panel,
        popup_icon,
        last_selection = "";

    //ask for settings
    chrome.runtime.sendMessage({"key": "settings"}, function(response) {
        setting_setup(response.settings);
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(request.key == "setting_update") {
                setting_setup(request.settings);
            }
    });

    function setting_setup(settings) {
        is_inline_enabled = settings.inline_enabled_box;
        is_inline_chinese = settings.inline_chinese_box;
        is_inline_icon    = settings.inline_icon_box;
        popup_setup();
    }

    function popup_setup() {
        if($(".BingDictPlus").length == 0 && is_inline_enabled) {

            popup_icon = $('<img class="'+extension_id+'">')
            .prop("src", chrome.extension.getURL("images/popup-icon.png"))
            .css({'position':'absolute'})
            .appendTo(document.body)
            .mouseover(function(event) {
                popup(popup_icon.position().top+30, popup_icon.position().left);
            }).hide();

            popup_panel = $('<div class="'+extension_id+'">').css({
                'width': 300,
                'position':'absolute',
                'background-color':'white',
                'border-style': 'solid',
                'border-width': '1px',
                'border-color': '#0066CC',
                'font-family': '"Microsoft Yahei",Tahoma,"SimSun"',
                'font-size': 14
            }).appendTo(document.body)
            .mouseleave(function() {
                popup_panel.hide();
            }).hide();

            $(document.body).mouseup(function(event) {
                var selection = window.getSelection().toString();
                if(selection.length > 0 && event.target.className != extension_id) {
                    popup_icon.css({
                        'top': event.pageY - 40,
                        'left': event.pageX + 30
                    }).show();
                }
            }).mousedown(function(event) {
                if(event.target.className != extension_id) {
                    popup_panel.hide();
                    popup_icon.hide();
                }
            });
        }   
    }

    function popup(top, left) {
        popup_panel.text("search result").css({
            'top': top,
            'left': left
        }).show();
    }

})(window, jQuery);