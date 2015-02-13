/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

var searchEngines = searchEngines || {};

;(function () {

  'use strict';

  // search selected text and response search result
  chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
    
    if (request.key === 'search') {
      searchEngines[request.engine].search(request.text, sendResponse);
    } else if (request.key === 'search_engines') {
      sendResponse(Object.keys(searchEngines));
    }
    
    return true; // Let sender keep the channel open until sendResponse is called
  });

}());
