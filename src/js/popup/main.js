/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

define(function(require, exports, module) {

  'use strict';

  var Handlebars = require('Handlebars');
  var $ = require('jQuery');

  var template = Handlebars.compile($('#entry-template').html());
  var html = template({
    inline: {
      title: '划译',
      enabledBox: '开启划译',
      iconBox: '开启图标'
    },
    other: {
      title: '其他',
      chineseBox: '中文翻译',
      autoplayBox: '自动播放'
    }
  });
  $('#entry-template').after(html);

});