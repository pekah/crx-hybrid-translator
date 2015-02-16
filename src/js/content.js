/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

;(function () {

  'use strict';

  var selection = '';
  var popIcon = createPopIcon();
  var popPanel = createPopPanel();

  document.body.addEventListener('mouseup', function (evt) {
    var newSelection = window.getSelection().toString();
    if (newSelection.length <= 0) {
      popIcon.hide();
    } else {
      var py = evt.pageY - 40;
      var px = evt.pageX + 30;
      var ww = window.innerWidth;
      popIcon.show(px, py, ww);
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
          panel.style.left = (px + panel.clientWidth + 20 > ww ? ww - panel.clientWidth - 20 : px) + 'px';
          panel.style.display = 'block';
        } else {
          var that = this;
          panel = document.createElement('iframe');
          panel.scrolling = 'no';
          panel.className = 'hybrid-translator';
          panel.addEventListener('mouseleave', function() {
            that.hide();
          }, false);
          document.body.appendChild(panel);
          this.element = panel;
          var $doc = panel.contentWindow.document;
          var $body;

          $get(chrome.extension.getURL('html/content.html'))
          // get iframe templet
          .then(function(response){
            $doc.documentElement.innerHTML = response;
            $body = panel.contentWindow.document.body;
            return $sendMessage({key: 'search', engine: 'bing', text: selection});
          })
          // bing dict result
          .then(function(bingResult) {
            searchResults.bing = bingResult;
            if (bingResult.title) {
              var title = $doc.createElement('h1');
              title.innerHTML = bingResult.title;
              $body.appendChild(title);
            }
            if (bingResult.cdef) {
              var cdef = bingResult.cdef;
              var defList = $doc.createElement('ul');
              defList.className = 'cdef';
              for (var i = 0; i < cdef.length; i += 1) {
                var li = $doc.createElement('li');
                var pos = $doc.createElement('div');
                var def = $doc.createElement('div');
                pos.className = 'pos';
                def.className = 'def';
                if (cdef[i].pos === 'web') {
                  defList.appendChild($doc.createElement('hr'));
                  pos.innerHTML = chrome.i18n.getMessage('web_def');
                } else {
                  pos.innerHTML = cdef[i].pos + '.';
                }
                def.innerHTML = cdef[i].def;
                li.appendChild(pos);
                li.appendChild(def);
                defList.appendChild(li);
              }
              $body.appendChild(defList);
              return $sendMessage({key: 'search', engine: 'iciba', text: selection});
            }
          })
          // iciba result (pronunciation)
          .then(function(icibaResult) {
            
            ///TODO
            panel.height = $doc.documentElement.scrollHeight || $doc.body.scrollHeight;
            that.show(px, py, ww);
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
}());
