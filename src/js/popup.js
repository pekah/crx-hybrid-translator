/*jshint nonew: false*/
/*global QRCode */



;(function () {

  'use strict';

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

}());
