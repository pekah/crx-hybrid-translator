/*jshint scripturl:true*/

/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

;(function () {

  'use strict';

  var IFRAME_WIDTH = 330;
  var selection = '';
  var popIcon = createPopIcon();
  var popPanel = createPopPanel();

  document.body.addEventListener('mouseup', function (evt) {
    var newSelection = window.getSelection().toString();
    if (newSelection.length <= 0) {
      popIcon.hide();
    } else {
      if (isContainChinese(newSelection) || isContainEnglish(newSelection)) {
        var py = evt.pageY - 40;
        var px = evt.pageX + 30;
        var ww = window.innerWidth;
        popIcon.show(px, py, ww);
      }
    }

    if (selection === newSelection) {
      popPanel.hide();
    } else {
      popPanel.destroy();
    }

    selection = newSelection;
  }, false);

  popIcon.element.addEventListener('mouseenter', function() {
    var py = popIcon.element.offsetTop;
    var px = popIcon.element.offsetLeft;
    var ww = window.innerWidth;
    popPanel.show(px, py, ww);
  }, false);

  function createPopIcon() {
    var logo = document.createElement('img');
    logo.className = 'hybrid-translator';
    logo.src = chrome.extension.getURL('images/icon-24.png');
    document.body.appendChild(logo);

    return {
      element: logo,
      hide: function() {
        logo.style.display = 'none';
      },
      show: function(px, py, ww) {
        logo.style.top = (py < 0 ? 2 : py) + 'px';
        logo.style.left = (px + 44 > ww ? ww - 44 : px) + 'px';
        logo.style.display = 'block';
      }
    };
  }

  function createPopPanel() {
    var searchResults = {};
    return {
      hide: function(){
        if (this.element) {
          this.element.style.display = 'none';
        }
      },
      destroy: function(){
        if (this.element) {
          document.body.removeChild(this.element);
          this.element = null;
        }
      },
      show: function(px, py, ww) {
        var panel = this.element;
        if (panel) {
          panel.style.top = (py + 30) + 'px';
          panel.style.left = (px + IFRAME_WIDTH + 20 > ww ? ww - IFRAME_WIDTH - 20 : px) + 'px';
          panel.style.display = 'block';
          panel.height = panel.contentWindow.document.body.scrollHeight;

        } else {
          panel = document.createElement('iframe');
          panel.scrolling = 'no';
          panel.className = 'hybrid-translator';
          panel.addEventListener('mouseleave', function() {
            $this.hide();
          }, false);
          document.body.appendChild(panel);
          this.element = panel;

          //global elements
          var $this = this;
          var $doc = panel.contentWindow.document;
          var $body = panel.contentWindow.document.body;
          var $phsym, $cdef;

          var i, j, k;

          $doc.head.innerHTML = '<link rel="stylesheet" href="' + chrome.extension.getURL('css/content-iframe.css') + '" />';

          // bing dict result(title, definitions)
          $sendMessage({key: 'search', engine: 'bing', text: selection})
          .then(function(bingResult) {
            searchResults.bing = bingResult;

            // add title
            if (bingResult.title) {
              var title = $doc.createElement('h1');
              title.innerHTML = bingResult.title;
              $body.appendChild(title);
            }

            // add pronunciation
            if (bingResult.phsym) {
              var phsym = bingResult.phsym;
              $phsym = $doc.createElement('div');
              $phsym.className = 'pron';
              for (i = 0; i < phsym.length; i += 1) {
                var lang = phsym[i].L;
                var symbol = $doc.createElement('span');
                symbol.className = 'phsym';
                symbol.innerHTML = chrome.i18n.getMessage(lang) + ': [' + phsym[i].V + ']';
                $phsym.appendChild(symbol);

                var voice = $doc.createElement('a');
                voice.href = 'javascript:void(0);';
                voice.className = 'voice';
                voice.style.display = 'none';
                $phsym.appendChild(voice);
              }
              $body.appendChild($phsym);
            }

            // add definitions
            if (bingResult.cdef) {
              var cdef = bingResult.cdef;
              $cdef = $doc.createElement('ul');
              $cdef.className = 'cdef';
              for (i = 0; i < cdef.length; i += 1) {
                var list = $doc.createElement('li');
                var pos = $doc.createElement('span');
                var def = $doc.createElement('span');
                pos.className = 'pos';
                def.className = 'def';
                if (cdef[i].pos === 'web') {
                  $cdef.appendChild($doc.createElement('hr'));
                  pos.innerHTML = chrome.i18n.getMessage('web_def');
                } else {
                  pos.innerHTML = cdef[i].pos + '.';
                }
                def.innerHTML = cdef[i].def;
                list.appendChild(pos);
                list.appendChild(def);
                $cdef.appendChild(list);
              }
              $body.appendChild($cdef);
            }

            // add machine translation
            if (bingResult.machine) {
              var mTitle = $doc.createElement('h2');
              mTitle.innerHTML = chrome.i18n.getMessage('machine_translation');
              $body.appendChild(mTitle);

            }
            $this.show(px, py, ww);
          })
          // iciba result (pronunciation)
          .then(function() {
            if (searchResults.bing.phsym) {
              $sendMessage({key: 'search', engine: 'iciba', text: selection})
              .then(function(icibaResult) {
                var icibaPron = icibaResult.pron;
                var phsym = searchResults.bing.phsym;
                var pronElems = $phsym.children;
                for (i = 0; i < phsym.length; i += 1) {
                  var lang = phsym[i].L;
                  if (icibaPron[lang]) {
                    var p = pronElems[2*i+1];
                    p.style.display = '';
                    p.onclick = voicePlay(icibaPron[lang]);
                    p.onmouseover = p.onclick;
                  }
                }
                function voicePlay(url) {
                  return function() {
                    new Audio(url).play();
                  };
                }
              });
            }
          });
        }
      }
    };
  }

  // Simple Promise GET XMLHttpRequest
  function $get(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = function () {
        reject(Error('Network Error'));
      };
      xhr.send();
    });
  }

  // Simple Promise Chrome sendMessage Request
  function $sendMessage(args) {
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(args, function (response) {
        if (response && response.key === 'success') {
          resolve(response);
        } else {
          reject();
        }
      });
    });
  }

  function isContainChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  function isContainEnglish(text) {
    return /[a-z,A-Z]/.test(text);
  }

}());
