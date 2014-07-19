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
        popup_contents,
        popup_icon,
        selection,
        lex_link = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon',
        trans_link = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation';

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
        if($('.'+extension_id).length == 0) {
            if(is_inline_enabled) {

                popup_icon = $('<img>').addClass(extension_id)
                .prop("src", chrome.extension.getURL("images/popup-icon.png"))
                .css({'position':'absolute','z-index': 99999})
                .appendTo(document.body)
                .mouseover(function(event) {
                    if(is_inline_enabled) {
                        popup_panel.show();
                    }
                }).hide();

                popup_panel = $('<div>').addClass(extension_id)
                .css({
                    'width': 300,
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
                        if(is_inline_chinese == false) {
                            if(isContainChinese(selection)) {
                                return;
                            }
                        }
                        // popup icon
                        if(is_inline_icon) {
                            if(event.target.className != extension_id) {
                                
                                var oy = event.offsetY - 40,
                                    ox = event.offsetX + 30,
                                    py = event.pageY - 40,
                                    px = event.pageX + 30,
                                    ww = $(window).width();
                                popup_icon.css({
                                    'top':  (oy < 0)? py - oy + 2 : py,
                                    'left': (ox+26 > ww)? ww - 26 : px
                                }).show();

                                popup_prepare(popup_icon.position().top+30, popup_icon.position().left, 
                                    popup_icon.offset().top+30, popup_icon.offset().left);

                            }
                        } else {
                            popup_prepare(event.pageY+10, event.pageX+20, event.offsetY+10, event.offsetX + 20);
                            popup_panel.show();
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

    function popup_prepare(py, px, oy, ox) {

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
                'left': (ox+302 > ww)? ww - 302 : px
            });

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

        // title
        $('<div>').addClass(extension_id)
        .text(data.QD.HW.V)
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

        $('<p>').addClass(extension_id)
        .text(data.MT.T.replace(/(\{\d*#)|(\$\d*\})/g, ""))
        .appendTo(popup_contents);
    }

    function isChinese(letter) { 
        var re = /[^\u4e00-\u9fa5]/; 
        if(re.test(letter)) return false; 
        return true; 
    }

    function isContainChinese(text) {
        var cnt = 0;
        for(var i=0;i < text.length ; i++)
        {
            if(isChinese(text.charAt(i)))
                cnt++;
        }
        if (cnt > 0) return true;
        return false;
    }

})(window, jQuery);