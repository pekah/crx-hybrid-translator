/*
 * Jesse Wong
 * @straybugs
 * https://github.com/Crimx/BingDictPlus
 * MIT Licensed
 */

(function ($) {

  "use strict"

  function saveSettings() {
    var data = {};
    $(".settings").each(function () {
      data[$(this).prop("id")] = $(this).prop("checked");
    });
    chrome.storage.local.set({"settings": data}, function () {
      chrome.storage.sync.set({"settings": data});
    });

    // notify every tab in every window to update settings from popup.html
    chrome.windows.getAll({
      "populate": true // true for asking for tabs
    }, function (windows) {
      $.each(windows, function (winKey, winVal) {
        $.each(winVal.tabs, function (tabKey, tabVal) {
          chrome.tabs.sendMessage( // not chrome.runtime.sendMessage
            tabVal.id,
            {
              "key": "setting_update",
              "settings": data
            }
          ); // no response
        });
      }); // end each windows
    });

  }

  function showSettings(data) {
    $.each(data, function (id, value) {
      $("#" + id).prop("checked", value);
    });
  }

  // ready
  $(function () {
    //show text base on locales
    $(".chromsg").text(
      function () {
        return chrome.i18n.getMessage($(this).attr("id"));
      }
    );

    $(".settings").click(saveSettings);

    //pull settings
    chrome.storage.local.get("settings", function (localData) {
      if (localData.settings) {
        showSettings(localData.settings);
      } else {
        chrome.storage.sync.get("settings", function (syncData) {
          if (syncData.settings) {
            showSettings(syncData.settings);
          } else {
            // first time setup
            $(".install").prop("checked", true);
            saveSettings();
          }
        });
      } // end else
    });
  }); // end jQuery()

}(jQuery));