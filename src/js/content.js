/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function ($) {

  'use strict';
  
  var SITE_LINK  = 'http://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&q=',
      LEX_LINK   = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon',
      TRANS_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation',
      VOICE_LINK = 'http://media.engkoo.com:8129/en-us/',

      bInlineEnabled = true,
      bTransChinese  = true,
      bTransIcon     = true,
      bTransAutoplay = false,

      iFrame,
      frameDoc, // iframe document
      popIcon;

  // require settings
  chrome.runtime.sendMessage({'key': 'setting_setup'}, function (response) {
    if (response) {
      settingSetup(response);
    }
  });

  // live update
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.key === 'setting_update') {
      settingSetup(request.settings);
    }
  });

  function settingSetup(settings) {
    bInlineEnabled = settings.inlineEnabledBox;
    bTransChinese  = settings.transChineseBox;
    bTransIcon     = settings.transIconBox;
    bTransAutoplay = settings.transAutoplayBox;
  }

  function show(element) {
    element.style.display = '';
    return element;
  }
  function hide(element) {
    element.style.display = 'none';
    return element;
  }

  // iframe setup
  iFrame = document.createElement('iframe');
  iFrame.scrolling = 'no';
  iFrame.class = 'crimxbdplus';
  iFrame.id = 'crimxframe';

  // icon setup
  popIcon = document.createElement('img');
  popIcon.class = 'crimxbdplus';
  popIcon.src = chrome.extension.getURL('images/popup-icon.png');
  popIcon.addEventListener('mouseenter', function (evt) {
    if (bInlineEnabled) {
      // iframePopup(popIcon.offset().top+30, popIcon.offset().left);
    }
  }, false);

  document.body.appendChild(hide(popIcon));
  document.body.appendChild(show(iFrame));
  iFrame = document.getElementById('crimxframe');
  frameDoc = iFrame.contentWindow.document;

  // request frame.html
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.extension.getURL('html/frame.html'), true);
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      frameSetup(xhr.responseText);
    }
  };
  xhr.send();

  function frameSetup(html) {
    frameDoc.head.innerHTML = '<link rel="stylesheet" type="text/css" href="' +
                               chrome.extension.getURL('css/frame.css') + '" />';
    frameDoc.body.innerHTML = html;

    frameDoc.getElementById('vpic').src = chrome.extension.getURL('images/voice.png');

    iFrame.height = frameDoc.body.scrollHeight;
  }
  
}(jQuery));