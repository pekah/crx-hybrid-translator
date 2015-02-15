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
    return {
      hide: function(){
        if (this.element) {
          this.element.style.display = 'none';
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
            popPanel.hide();
          }, false);
          document.body.appendChild(panel);
          this.element = panel;
          $get(chrome.extension.getURL('html/content.html')).then(function(response){
            var pdoc = panel.contentWindow.document;
            pdoc.documentElement.innerHTML = response;
            panel.height = pdoc.documentElement.scrollHeight || pdoc.body.scrollHeight;
            return  pdoc.body;
          }).then(function(pbody) {
            // Request search result
            ///TODO
            that.show(px, py, ww);
          });
        }
      },
      destroy: function(){
        ///TODO
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
}());
