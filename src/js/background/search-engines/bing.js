/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/hybrid-translator
 * MIT Licensed
 */

var searchEngines = (function (searchEngines) {

  'use strict';
  
  // Engine ID
  searchEngines.bing = {
    name: chrome.i18n.getMessage('engine_bing'),
    search: search
  };

  var BACKUP_LINK = 'http://cn.bing.com/dict/search?q=%s';
  var LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q=%s';
  var TRANS_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q=%s';
  var PRON_LINK = 'http://media.engkoo.com:8129/';

  // get result and use callback to send response
  function search(text, callback) {
    $get(LEX_LINK.replace(/%[sS]/, text))
    .then(lexChecker, function() {
      return $get(TRANS_LINK.replace(/%[sS]/, text));
    })
    .then(transChecker, function() {
      return $get(BACKUP_LINK.replace(/%[sS]/, text));
    })
    .then(backupChecker, noResult);

    /* 
     * response format as follows:
     *   title[string]: search title
     *   phsym[object]: phonetic symbols
     *     - phsym['UK']
     *     - phsym['US']
     *   pron[object]: audio url
     *     - pron['UK']
     *     - pron['US']
     *   cdef[array]: common definitions
     *     array items[object]:
     *       - 'pos'[string] part of speech
     *       - 'def'[string] definition
     */
    function lexChecker(response) {
      var data = JSON.parse(response);
      if (!data.Q || !data.QD) {
        // no lexicon result
        transChecker(response);
      } else {
        var result = {
          title: data.QD.HW.V || data.Q,
          phsym: data.QD.PRON,
          pron: {
            'US': PRON_LINK + 'en-us/' + data.QD.HW.SIG + '.mp3',
            'UK': PRON_LINK + 'en-gb/' + data.QD.HW.SIG + '.mp3'
          },
          cdef: []
        };
        for (var i in data.QD.C_DEF) {
          result.cdef.push({
            'pos': data.QD.C_DEF[i].POS,
            'def': data.QD.C_DEF[i].SEN[0].D
          });
        }
        callback(result);
      }
    }

    function transChecker() {
      noResult();
    }

    function backupChecker() {
      noResult();
    }

    function noResult() {
      callback(null);
    }
  }

  return searchEngines;
})(searchEngines || {});