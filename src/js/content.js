/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function () {

  'use strict';
  
  var CLIENT_LINK  = 'http://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&q=',
      SITE_LINK = 'http://cn.bing.com/dict/search?q=',
      BING_LINK = 'http://cn.bing.com/search?q=',
      LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q=',
      TRANS_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q=',
      VOICE_LINK = 'http://media.engkoo.com:8129/en-us/',

      bInlineEnabled = true,
      bTransChinese  = true,
      bTransIcon     = true,
      bTransAutoplay = false,

      selection,
      voiceName,

      popIcon,
      iFrame,
      frameDoc, // iframe document
      
      vpic,
      titleText,
      voiceText,
      contentList,
      hrLine,
      webPos,
      webDef,
      macTrans,
      macDef,
      noResult,
      faildLink,
      bottomLink1,
      bottomLink2;

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

  // iframe setup
  iFrame = document.createElement('iframe');
  iFrame.scrolling = 'no';
  iFrame.className = 'crimxbdplus';
  iFrame.id = 'crimxframe';
  iFrame.style.display = 'none';

  // icon setup
  popIcon = document.createElement('img');
  popIcon.className = 'crimxbdplus';
  popIcon.src = chrome.extension.getURL('images/popup-icon.png');
  popIcon.style.display = 'none';

  document.body.appendChild(popIcon);
  document.body.appendChild(iFrame);
  frameDoc = iFrame.contentWindow.document;

  // request frame.html
  var getFrameHTML = new XMLHttpRequest();
  getFrameHTML.open('GET', chrome.extension.getURL('html/frame.html'), true);
  getFrameHTML.onload = function (e) {
    if (getFrameHTML.status === 200) {
      frameSetup(getFrameHTML.responseText);
    }
  };
  getFrameHTML.send();

  function show() {
    var isFrame;
    for (var i = 0; i < arguments.length; i += 1) {
      arguments[i].style.display = ''; 
      if (arguments[i] === iFrame) {
        isFrame = true;
      }
    }
    if (isFrame) {
      var px = popIcon.offsetLeft,
          ww = window.innerWidth;
      iFrame.style.top = (popIcon.offsetTop + 30) + 'px';
      iFrame.style.left = (px + iFrame.clientWidth + 20 > ww ? ww - iFrame.clientWidth - 20 : px) + 'px';
      iFrame.style.height = frameDoc.body.scrollHeight + 'px';
    }
  }
  
  function hide() {
    for (var i = 0; i < arguments.length; i += 1) {
      arguments[i].style.display = 'none';
    }
  }

  function frameSetup(html) {
    frameDoc.head.innerHTML = '<link rel="stylesheet" type="text/css" href="' +
                               chrome.extension.getURL('css/frame.css') + '" />';
    frameDoc.body.innerHTML = html;

    vpic = frameDoc.getElementById('vpic');
    titleText = frameDoc.getElementById('title');
    voiceText = frameDoc.getElementById('voice');
    contentList = frameDoc.getElementById('content');
    hrLine = frameDoc.getElementById('hr');
    webPos = frameDoc.getElementById('webpos');
    webDef = frameDoc.getElementById('webdef');
    macTrans = frameDoc.getElementById('mactrans');
    macDef = frameDoc.getElementById('macdef');
    noResult = frameDoc.getElementById('noresult');
    faildLink = frameDoc.getElementById('faildlink');
    bottomLink1 = frameDoc.getElementById('bottomlink1');
    bottomLink2 = frameDoc.getElementById('bottomlink2');

    vpic.src = chrome.extension.getURL('images/voice.png');
    webPos.innerHTML = chrome.i18n.getMessage('web_def');
    macTrans.innerHTML = chrome.i18n.getMessage('machine_translation') + ':';
    noResult.innerHTML = chrome.i18n.getMessage('no_result');
    bottomLink1.innerHTML = chrome.i18n.getMessage('more_definitions');
    bottomLink2.innerHTML = chrome.i18n.getMessage('web_search');

    addListeners();
  }

  function isContainChinese(text) {
    for (var i = 0; i < text.length; i += 1) {
      if (!(/[^\u4e00-\u9fa5]/.test(text.charAt(i)))) {
        return true;
      }
    }
    return false;
  }

  function genPronunciation(dataQD) {
    var i,
        t = '';
    for (i in dataQD.PRON) {
      var pron = dataQD.PRON[i];
      if (pron.L) {
        t += chrome.i18n.getMessage(pron.L) + ': [' + pron.V + ']  ';
      }
    }
    voiceText.innerHTML = t;
  }

  function genContntList(dataQD) {
    var i,
        definitions = dataQD.C_DEF,
        bWebDef = false,
        li,
        pos,
        def;

    for (i in definitions) {
      if (definitions[i].POS !== 'web') {
        li = frameDoc.createElement('li');
        pos = frameDoc.createElement('span');
        def = frameDoc.createElement('span');
        pos.className = 'pos';
        pos.innerHTML = definitions[i].POS || '';
        def.className = 'def';
        def.innerHTML = definitions[i].SEN[0].D || '';
        contentList.appendChild(li);
        li.appendChild(pos);
        li.appendChild(def);
      } else {
        bWebDef = definitions[i];
      }
      if (bWebDef) {
        show(hrLine, webPos, webDef);
        webDef.innerHTML = bWebDef.SEN[0].D || '';
      }
    }
  }

  function showLexFrame(data) {
    var dataQD = data.QD,
        dataQDHW = dataQD.HW;

    // voice
    voiceName = dataQDHW && dataQDHW.SIG;

    // title
    titleText.innerHTML = dataQDHW && (dataQDHW.V || data.Q || '');

    // pronunciation
    genPronunciation(dataQD);

    // content list
    genContntList(dataQD);

    show(iFrame, vpic, titleText, contentList);
    
    if (bTransAutoplay && voiceName) {
      new Audio(VOICE_LINK + voiceName + '.mp3').play();
    }
  }

  function showTransFrame(dataMT) {
    if (dataMT.T) {
      macDef.innerHTML = dataMT.T.replace(/(\{\d*#)|(\$\d*\})/g, '');
      show(iFrame, macTrans, macDef);
    }
  }

  function showFaildFrame() {
    faildLink.href = SITE_LINK + selection;
    faildLink.innerHTML = selection;
    show(iFrame, noResult, faildLink);
  }

  function setFrame(data) {
    clearFrame();
    if (data.Q && data.QD) {
      showLexFrame(data);
    } else {
      // request bing dict translation data
      var getTransData = new XMLHttpRequest();
      getTransData.open('GET', TRANS_LINK + selection, true);
      getTransData.onload = function (e) {
        if (getTransData.status === 200) {
          var transData = JSON.parse(getTransData.responseText);
          if (transData.MT) {
            showTransFrame(transData.MT);
          } else {
            showFaildFrame();
          }
        }
      };
      getTransData.send();
    }
  }

  function clearFrame() {
    hide(
      vpic,
      titleText,
      voiceText,
      contentList,
      hrLine,
      webPos,
      webDef,
      macTrans,
      macDef,
      noResult,
      faildLink
    );
    while (contentList.firstChild) {
      contentList.removeChild(contentList.firstChild);
    }
    bottomLink1.style.visibility = 'hidden';
    bottomLink2.style.visibility = 'hidden';
  }

  // listeners
  function addListeners() {
    popIcon.addEventListener('mouseenter', function () {
      // request bing dict lex data
      var getLexData = new XMLHttpRequest();
      getLexData.open('GET', LEX_LINK + selection, true);
      getLexData.onload = function (e) {
        if (getLexData.status === 200) {
          setFrame(JSON.parse(getLexData.responseText));
        }
      };
      getLexData.send();
    }, false);

    iFrame.addEventListener('mouseleave', function () {
      hide(iFrame);
    }, false);

    iFrame.addEventListener('mouseenter', function() {
      
      bottomLink1.style.visibility = 'visible';
      bottomLink1.href = SITE_LINK + selection;
      bottomLink2.style.visibility = 'visible';
      bottomLink2.href = BING_LINK + selection;
    }, false);

    vpic.addEventListener('mouseenter', function () {
      if (voiceName) {
        new Audio(VOICE_LINK + voiceName + '.mp3').play();
      }
    }, false);

    document.body.addEventListener('mouseup', function (evt) {
      selection = window.getSelection().toString();
      if (selection.length <= 0) {
        hide(popIcon);
        hide(iFrame);
        return;
      }

      // inline translation
      if (bInlineEnabled) {
        if (!bTransChinese && isContainChinese(selection)) {
          return;
        }

        if(bTransIcon) {
          var py = evt.pageY - 40,
              px = evt.pageX + 30,
              ww = window.innerWidth;
          popIcon.style.top = ((py < 0)? 2 : py) + 'px';
          popIcon.style.left = ((px + 44 > ww)? ww - 44 : px) + 'px';
          show(popIcon);
        }
      }
    }, false);
  }
  
}());