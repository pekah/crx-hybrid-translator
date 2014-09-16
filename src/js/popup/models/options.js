/*!
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

define(function(require, exports, module) {

  'use strict';

  var Backbone = require('Backbone');

  var Settings = Backbone.Model.extend({

    defaults: {
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
    }

  });

  module.exports = Settings;

});