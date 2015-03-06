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

  var appActive = true;
  chrome.runtime.sendMessage({key: 'config'}, function (response) {
    if (response) {
      appActive = response.appActive;
    }
  });
  // live update state
  chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
    if (request.key === 'app-state-changed') {
      appActive = request.appActive;
    }
  });

  document.body.addEventListener('mouseup', function (evt) {
    var newSelection = window.getSelection().toString();
    if (newSelection.length <= 0) {
      popIcon.hide();
    } else {
      if (appActive) {
        if (isContainChinese(newSelection) || isContainEnglish(newSelection)) {
          var py = evt.pageY - 40;
          var px = evt.pageX + 30;
          var ww = window.innerWidth;
          popIcon.show(px, py, ww);
        }
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
          var $body = $doc.createElement('div');
          var $title, $phsym, $cdef;

          var i, j, k;

          $doc.head.innerHTML = '<link rel="stylesheet" href="' + chrome.extension.getURL('css/content-iframe.css') + '" />' + 
            '<link rel="stylesheet" href="' + chrome.extension.getURL('css/loader.css') + '" />';

          // add loader
          $doc.body.innerHTML = '<div class="loader"><div></div><div></div><div></div><div></div><div></div></div>';
          $body.className = 'wrapper';
          $this.show(px, py, ww);
 
          $sendMessage({key: 'search', engine: 'bing', text: selection})
          .then(addBingResult)
          .then(function() {
            if (searchResults.bing.phsym) {
              $sendMessage({key: 'search', engine: 'iciba', text: selection})
              .then(addIcibaResult);
            }
          })
          .then(function() {
            $sendMessage({key: 'search', engine: 'urban', text: selection})
            .then(addUrbanResult);
          });
        }

        function addSearchIcons() {

          var searchers = {
            bing: {
              name: 'bing',
              sURL: 'http://cn.bing.com/search?q=%s',
              tURL: 'http://cn.bing.com/dict/search?q=%s'
            },
            baidu: {
              name: 'baidu',
              sURL: 'http://www.baidu.com/s?ie=UTF-8&wd=%s'
            },
            google: {
              name: 'google',
              sURL: 'http://74.125.12.150/#newwindow=1&q=%s',
              tURL: 'http://translate.google.cn/#auto/zh-CN/%s'
            }
          };

          var spanel = $doc.createElement('div');
          spanel.className = 'search-panel';
          $body.appendChild(spanel);

          // rightclick
          spanel.oncontextmenu = function(event) {
            var sName = /^(\S*)-search$/i.exec(event.path[1].id)[1];
            var tURL = sName && searchers[sName].tURL;
            if (tURL) {
              chrome.runtime.sendMessage({key: 'new-tab', url: tURL.replace(/%[sS]/, selection)});
              event.preventDefault();
            }
          };

          for (var i in searchers) {
            addIcon(searchers[i]);
          }

          function addIcon(searcher) {
            var $a = $doc.createElement('a');
            $a.className = 'search-icon';
            $a.id = searcher.name + '-search';
            $a.title = chrome.i18n.getMessage(searcher.name + '_search');
            $a.target = '_blank';
            $a.href = searcher.sURL.replace(/%[sS]/, selection);
            var $img = $doc.createElement('img');
            $img.src = chrome.extension.getURL('images/' + searcher.name + '.png');
            $a.appendChild($img);
            spanel.appendChild($a);
          }
        }

        function addUrbanResult(uResult) {
          if (uResult.meaning) {
            var urban = $doc.createElement('a');
            urban.className = 'urban';
            urban.href = uResult.href;
            urban.target = '_blank';

            var title = $doc.createElement('h2');
            title.innerHTML = chrome.i18n.getMessage('engine_urban');
            urban.appendChild(title);

            var meaning = $doc.createElement('p');
            meaning.innerHTML = uResult.meaning;
            urban.appendChild(meaning);

            var example = $doc.createElement('p');
            example.className = 'urban-example';
            example.innerHTML = uResult.example;
            urban.appendChild(example);

            $body.appendChild(urban);
            $this.show(px, py, ww);
          }
        }

        function addIcibaResult(icibaResult) {
          
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
        }

        function addBingResult(bingResult) {
            searchResults.bing = bingResult;

            addSearchIcons();

            // add title
            if (bingResult.title) {
              var t = $doc.createElement('h1');
              t.innerHTML = bingResult.title;
              var $title = $doc.createElement('a');
              $title.href = 'http://www.iciba.com/' + selection;
              $title.target = '_blank';
              $title.appendChild(t);
              $body.appendChild($title);
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
            if (bingResult.mt) {
              var mTitle = $doc.createElement('h2');
              mTitle.innerHTML = chrome.i18n.getMessage('machine_translation');
              $body.appendChild(mTitle);

              var mdiv = $doc.createElement('div');
              mdiv.innerHTML = bingResult.mt;
              $body.appendChild(mdiv);
            }

            // add no result
            if (bingResult.noresult) {
              var nTitle = $doc.createElement('h2');
              nTitle.innerHTML = chrome.i18n.getMessage('no_result_title');
              $body.appendChild(nTitle);

              var ndiv = $doc.createElement('div');
              ndiv.innerHTML = chrome.i18n.getMessage('no_result_content');
              $body.appendChild(ndiv);
            }

            $doc.body.innerHTML = '';
            $doc.body.appendChild($body);
            $this.show(px, py, ww);
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
        if (response) {
          resolve(response);
        } else {
          reject(args);
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
