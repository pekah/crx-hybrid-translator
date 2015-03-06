/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

;(function() {

  'use strict';

  // pull settings from local or google
  chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
    if (request.key === 'config') {
      chrome.storage.local.get('config', function (localData) {
        if (localData.config) {
          localData.key = 'success';
          sendResponse(localData.config);
        } else {
          chrome.storage.sync.get('config', function (syncData) {
            if (syncData.config) {
              syncData.key = 'success';
              sendResponse(syncData.config);
            } else {
              sendResponse(null);
            }
          });
        }
      });
    } else if (request.key === 'new-tab') {
      chrome.tabs.create({url: request.url});
      sendResponse({key: 'success'});
    }
    return true; // Let sender keep the channel open until sendResponse is called
  });

  // settings before app starts
  chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason === 'install' || details.reason === 'update'){
      var data = {
        appActive: true
      };
      chrome.storage.local.set({config: data}, function () {
        chrome.storage.sync.set({config: data});
      });
    }
  });
  
}());
