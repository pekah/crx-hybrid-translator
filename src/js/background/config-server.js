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

      // update notification
      var i = 1;
      var opt = {
        type: 'list',
        title: '多词典划译已更新到 3.0.1',
        message: '多词典划译已更新到 3.0.1',
        eventTime: Date.now() + 5000,
        isClickable: true,
        iconUrl: 'images/icon-128.png',
        items: [{ title: (i++)+'. ', message: '增加了划译开关'},
                { title: (i++)+'. ', message: '增加了 urban 词典的例子'},
                { title: (i++)+'. ', message: '增加了必应搜索图标'},
                { title: (i++)+'. ', message: '搜索图标右击可以变成翻译搜索'},
                { title: (i++)+'. ', message: '修复了几处错误并加速了结果显示'}]
      };
      chrome.notifications.create('', opt, function() {});
    }
  });
  
}());
