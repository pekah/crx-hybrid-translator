/*jshint
    nonew: false, 
    scripturl:true
 */
/*global QRCode */



;(function () {

  'use strict';

  // global
  var appActive = false;

  chrome.tabs.getSelected(null, function(tab) {
    console.dir(tab);
    document.getElementById('page-title').innerHTML = tab.title;

    new QRCode(document.getElementById('qrcode'), {
      text: tab.url,
      width: 200,
      height: 200,
      colorDark : '#000000',
      colorLight : '#ffffff',
      correctLevel : QRCode.CorrectLevel.H
    });
  });

  chrome.runtime.sendMessage({key:'config'}, function (response) {
    if (response) {
      var b = document.createElement('a');
      b.href = '#';
      if (response.appActive) {
        beActive();
      } else {
        beInactive();
      }
      b.addEventListener('click', function() {
        var appActive = true;
        if (b.className.indexOf('active') >= 0) {
          beInactive();
          appActive = false;
        } else {
          beActive();
        }
        chrome.runtime.sendMessage({
          key:'save',
          data: { appActive: appActive }
        });
        chrome.tabs.query({}, function(tabs) {
          var message = {
            key: 'app-state-changed',
            appActive: appActive
          };
          for (var i = 0; i < tabs.length; i += 1) {
            console.log(tabs[i].id);
            chrome.tabs.sendMessage(tabs[i].id, message);
          }
        });
      });
      var wrapper = document.getElementById('app-active');
      wrapper.appendChild(b);
    }

    function beInactive() {
      b.className = b.className.replace('active', '');
      b.innerHTML = chrome.i18n.getMessage('app_inactive');
    }

    function beActive() {
      b.className += ' active';
      b.innerHTML = chrome.i18n.getMessage('app_active');
    }
  });
}());
