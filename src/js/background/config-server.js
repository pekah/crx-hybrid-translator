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
      chrome.storage.local.get('settings', function (localData) {
        if (localData.settings) {
          localData.key = 'success';
          sendResponse(localData.settings);
        } else {
          chrome.storage.sync.get('settings', function (syncData) {
            if (syncData.settings) {
              syncData.key = 'success';
              sendResponse(syncData.settings);
            } else {
              sendResponse(null);
            }
          });
        }
      });
    }
    return true; // Let sender keep the channel open until sendResponse is called
  });
  
}());
