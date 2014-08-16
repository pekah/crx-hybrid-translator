/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function ($) {

  "use strict"
  
  var SITE_LINK  = "http://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&q=",
      LEX_LINK   = "http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon",
      TRANS_LINK = "http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation",
      VOICE_LINK = "http://media.engkoo.com:8129/en-us/",

      bInlineEnabled = true,
      bTransChinese  = true,
      bTransIcon     = true,
      bTransAutoplay = false,

      frameDoc, // iframe document
      popIcon;


  // require settings
  chrome.runtime.sendMessage({"key": "setting_setup"}, function (response) {
    if (response) {
      settingSetup(response);
    }
  });

  // live update
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.key === "setting_update") {
      settingSetup(request.settings);
    }
  });

  function settingSetup(settings) {
    bInlineEnabled = settings.inline_enabled_box;
    bTransChinese  = settings.trans_chinese_box;
    bTransIcon     = settings.trans_icon_box;
    bTransAutoplay = settings.trans_autoplay_box;
  }

  function show(element) {
    element.style.visibility = "visible";
    return element;
  }
  function hide(element) {
    element.style.visibility = "hidden";
    return element;
  }

  // iframe setup
  var iFrame = document.createElement("iframe");
  iFrame.scrolling = "no";
  iFrame.class = "crimxbdplus";
  iFrame.id = "crimxframe";
  document.body.appendChild(iFrame);
  frameDoc = document.getElementById("crimxframe").contentWindow.document;

  // request frame.html
  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL("html/frame.html"), true);
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      frameSetup(xhr.responseText);
    }
  }
  xhr.send();

  // icon setup
  popIcon = document.createElement("img");
  popIcon.class = "crimxbdplus";
  popIcon.src = chrome.extension.getURL("images/popup-icon.png");
  popIcon.addEventListener("mouseenter", function (evt) {
    if (bInlineEnabled) {
      // iframePopup(popIcon.offset().top+30, popIcon.offset().left);
    }
  }, false);
  document.body.appendChild(popIcon);

  function frameSetup(html) {
    frameDoc.head.innerHTML = '<link rel="stylesheet" type="text/css" href="' +
                               chrome.extension.getURL("css/frame.css") + '" />';
    frameDoc.body.innerHTML = html;
  }

}(jQuery));