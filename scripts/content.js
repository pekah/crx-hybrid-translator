/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function(window, $, undefined){
    var extension_id = "BingDictPlus" + chrome.runtime.id,
        is_inline_enabled = true,
        is_trans_chinese  = false,
        is_trans_icon     = true,
        is_trans_autoplay = false,
        panel_width = 300,
        popup_panel,
        popup_contents,
        popup_icon,
        selection,
        lex_link = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon',
        trans_link = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation',
        voice_link = 'http://media.engkoo.com:8129/en-us/',
        voice;

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
        is_trans_chinese  = settings.trans_chinese_box;
        is_trans_icon     = settings.trans_icon_box;
        is_trans_autoplay = settings.trans_autoplay_box;
        popup_setup();
    }

    function popup_setup() {
        if($('.'+extension_id).length == 0) {
            if(is_inline_enabled) {

                popup_icon = $('<img>').addClass(extension_id)
                .prop("src", chrome.extension.getURL("images/popup-icon.png"))
                .css({'position':'absolute','z-index': 99999})
                .appendTo(document.body)
                .mouseover(function(event) {
                    if(is_inline_enabled) {
                        popup(popup_icon.offset().top+30, popup_icon.offset().left);
                    }
                }).hide();

                popup_panel = $('<div>').addClass(extension_id)
                .css({
                    'width': panel_width,
                    'position':'absolute',
                    'z-index': 99998,
                    'background-color':'white',
                    'border-style': 'solid',
                    'border-width': '1px',
                    'border-color': '#0066CC'
                })
                .appendTo(document.body)
                .mouseleave(function() {
                    popup_panel.hide();
                }).hide();

                popup_contents = $('<div>').addClass(extension_id)
                .css({
                    'margin': 10,
                    'color': '#1A1A1A',
                    'font-size': 12
                }).appendTo(popup_panel);

                $(document.body).mouseup(function(event) {
                    selection = window.getSelection().toString();
                    if(selection.length <= 0) return;

                    if(is_inline_enabled) {
                        if(is_trans_chinese == false) {
                            if(isContainChinese(selection)) {
                                return;
                            }
                        }
                        // popup icon
                        if(is_trans_icon) {
                            if(event.target.className != extension_id) {
                                
                                var py = event.pageY - 40,
                                    px = event.pageX + 30,
                                    ww = $(window).width();
                                popup_icon.css({
                                    'top':  (py < 0)? 2 : py,
                                    'left': (px+26 > ww)? ww - 26 : px
                                }).show();

                            }
                        } else {
                            popup(event.pageY+10, event.pageX+20);
                        }
                    }
                }).mousedown(function(event) {
                    if(event.target.className != extension_id) {
                        popup_panel.hide();
                        popup_icon.hide();
                    }
                });
            }
        } else {
            popup_panel.hide();
            popup_icon.hide();
        }
    }

    function popup(py, px) {

        popup_contents.empty();

        $.get(lex_link, {'q': selection,'format':'application/json'}, function(lex_data) {
            // no result
            if(lex_data.Q == null) {
                // try machine translation
                $.get(trans_link, {'q': selection,'format':'application/json'}, function(trans_data) {
                    if(trans_data.MT == null) {
                        popup_no_result();
                    } else {
                        popup_trans(trans_data);
                    }
                });
            } else {
                popup_lex(lex_data); 
            }

            var ww = $(window).width();
            popup_panel.css({
                'top': py,
                'left': (px+panel_width+2 > ww)? ww - panel_width+2 : px
            }).show();

            $('.'+extension_id).css({
                'text-align': 'left',
                'font-family': '"Microsoft Yahei",Tahoma,"SimSun"',
                'text-shadow': '0px 0px',
                'line-height': 'normal'
            });
        });
    }

    function popup_no_result() {
        $('<div>').addClass(extension_id)
        .css({'font-weight': 'bold'})
        .text(chrome.i18n.getMessage("no_result"))
        .appendTo(popup_contents);

        $('<a>').addClass(extension_id)
        .prop("href", "http://cn.bing.com/dict/search?q="+selection)
        .css('text-decoration', 'NONE')
        .text(selection)
        .appendTo(popup_contents);
    }

    function popup_lex(data) {

        // voice
        if(data.QD.HW.SIG) {
            voice = new Audio(voice_link+data.QD.HW.SIG+'.mp3');
            $('<img>').addClass(extension_id)
            .prop("src", chrome.extension.getURL("images/voice.png"))
            .css({
                'float':'right',
                'width': 24,
                'margin-right': 20
            })
            .mouseover(function() {
                voice.play();
            })
            .appendTo(popup_contents);

            if(is_trans_autoplay) {
                voice.play();
            }
        }

        // title
        $('<div>').addClass(extension_id)
        .text((data.QD.HW.V)?data.QD.HW.V:data.Q)
        .css({
            'font-weight': 'bold', 
            'font-size': 20
        }).appendTo(popup_contents);

        // pronunciation
        var pron = $('<div>').addClass(extension_id)
        .css({'color': 'grey'})
        .appendTo(popup_contents);

        for(var p in data.QD.PRON) {
            var language = data.QD.PRON[p].L;
            if(language) {
                $('<span>').addClass(extension_id)
                .text(chrome.i18n.getMessage(language) + 
                ": [" + data.QD.PRON[p].V + "]") 
                .css({'margin-right': 15})
                .appendTo(pron);
            }
        }

        // definitions
        var definitions = data.QD.C_DEF;
        var web_def = false;
        for(var d in definitions) {
            if(definitions[d].POS != 'web') {
                $('<div>')
                .addClass(extension_id)
                .css({'margin': '10px 0px 10px 0px'})
                .appendTo(popup_contents)
                .append(
                    $('<div>').addClass(extension_id)
                    .css({
                        'float': 'left',
                        'width': '50px'
                    })
                    .append(
                        $('<span>').addClass(extension_id)
                        .text('.')
                        .css({
                            'font-size': 2,
                            'color': 'grey',
                            'background-color': 'grey'
                        }),

                        $('<span>').addClass(extension_id)
                        .text(' '+definitions[d].POS+'. ')
                        .css({
                            'color': 'white',
                            'background-color': 'grey'
                        }),

                        $('<span>').addClass(extension_id)
                        .text('.')
                        .css({
                            'font-size': 2,
                            'color': 'grey',
                            'background-color': 'grey'
                        })
                    ),
                    $('<div>').addClass(extension_id)
                    .css({
                        'margin-left': '55px',
                    })
                    .append(
                        $('<span>').addClass(extension_id)
                        .text(definitions[d].SEN[0].D)
                    )
                );
            } else {
                web_def = d;
            }
        }
        if(web_def) {
            $('<hr>').addClass(extension_id).appendTo(popup_contents);
            $('<div>').addClass(extension_id)
            .css({'margin-top': '10px'})
            .appendTo(popup_contents)
            .append(
                $('<div>').addClass(extension_id)
                .css({
                    'float': 'left',
                    'width': '50px',
                })
                .append(
                    $('<span>').addClass(extension_id)
                    .text(' '+chrome.i18n.getMessage('web_def')+' ')
                    .css({
                        'color': 'white',
                        'background-color': '#333333',
                    })
                ),
                $('<div>').addClass(extension_id)
                .css({
                    'margin-left': '55px'
                })
                .append(
                    $('<span>').addClass(extension_id)
                    .text(definitions[web_def].SEN[0].D)
                )
            );
        }
    }

    function popup_trans(data) {
        $('<div>').addClass(extension_id)
        .css({'font-weight': 'bold'})
        .text(chrome.i18n.getMessage("machine_translation")+":")
        .appendTo(popup_contents);

        $('<span>').addClass(extension_id)
        .text(data.MT.T.replace(/(\{\d*#)|(\$\d*\})/g, ""))
        .appendTo(popup_contents);
    }

    function isChinese(letter) { 
        var re = /[^\u4e00-\u9fa5]/; 
        if(re.test(letter)) return false; 
        return true; 
    }

    function isContainChinese(text) {
        for(var i = 0; i < text.length; i++) {
            if(isChinese(text.charAt(i))) {
                return true;
            }
        }
        return false;
    }

})(window, jQuery);