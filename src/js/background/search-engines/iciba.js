/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

var searchEngines = (function (searchEngines) {

  'use strict';
  
  // Engine ID
  searchEngines.iciba = {
    name: chrome.i18n.getMessage('engine_iciba'),
    search: search
  };

  var LEX_LINK = 'http://ct.dict-client.iciba.com/2013-01-22/?action=client&word=%s';
  var BACKUP_LINK = 'http://www.iciba.com/%s';

  // get result and use callback to send response
  function search(text, callback) {
    $get(LEX_LINK.replace(/%[sS]/, text))
    .then(lexChecker, function() {
      $get(BACKUP_LINK.replace(/%[sS]/, text))
      .then(lexChecker, noResult);
    });
    

    /* 
     * response format as follows:
     *   key[string]: 'success'
     *   pron[object]: audio url
     *     - pron['UK']
     *     - pron['US']
     */
    function lexChecker(response) {
      var r = /asplay\S+?(http\S+?\.mp3)/ig; 
      callback({
        key: 'success',
        pron: {
          UK: r.exec(response)[1],
          US: r.exec(response)[1]
        }
      });
    }

    function noResult() {
      callback(null);
    }
  }

  return searchEngines;
})(searchEngines || {});
