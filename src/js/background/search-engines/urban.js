/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

var searchEngines = (function (searchEngines) {

  'use strict';
  
  // Engine ID
  searchEngines.urban = {
    name: chrome.i18n.getMessage('engine_urban'),
    search: search
  };

  var LEX_LINK = 'http://www.urbandictionary.com/define.php?term=%s';

  // get result and use callback to send response
  function search(text, callback) {
    $get(LEX_LINK.replace(/%[sS]/, text))
    .then(lexChecker, noResult);
    

    /* 
     * response format as follows:
     *   key[string]: 'success'
     *   pron[object]: audio url
     *     - pron['UK']
     *     - pron['US']
     */
    function lexChecker(response) {
      document.body.innerHTML = response;
      var $meaning = document.getElementsByClassName('meaning')[0];
      var $example = document.getElementsByClassName('example')[0];
      if ($meaning) {
        callback({
          meaning: $meaning.innerHTML,
          example: $example.innerHTML,
          href: LEX_LINK.replace(/%[sS]/, text)
        });
      }
    }

    function noResult() {
      callback({noresult: true});
    }
  }

  return searchEngines;
})(searchEngines || {});
