var gp = require("sdk/preferences/service");
gp.set("devtools.storage.enabled", true); //enable storage view in devtools
gp.set("security.mixed_content.block_active_content", false); //cors enabled

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

const {Cc,Ci} = require("chrome");
var currentWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
 /////////////////////////////var ws = require("./net/websocket")('ws://10.0.0.158:8080');
  var ws = new currentWindow.Services.appShell.hiddenDOMWindow.WebSocket('wss://scooby-boxy.rhcloud.com:8443', ['13', '8']);
  //var ws = new currentWindow.Services.appShell.hiddenDOMWindow.WebSocket('ws://10.0.0.158:8080', ['13', '8']);
  currentWindow.xxx = ws;

pageMod.PageMod({
  include: "*",
  contentStyleFile: data.url("OrangePeel.css"),
  contentScriptFile: [
  data.url("libs/polyfill.js"),
  data.url("libs/fingerprint.js"),
  data.url("libs/localforage.js"),
  data.url("libs/timeuuid.js"),
  data.url("OrangePeel_Events.js"),
  data.url("OrangePeel_Functions.js"),
  data.url("OrangePeel_onPageshow.js")
  ],
  onAttach: function(tab_worker) {

    tab_worker.port.on('client_to_websocket', function (data) {
      var payload = JSON.stringify(data);
     // console.log("clientpage(onPageshow.js) - to - main.js - to - websocket", data);
      ws.send(payload); //sending to server.
    });

    //WebSocket to ClientPage
    // ws.addEventListener('message', ws_to_onpageshow);
    ws.onmessage = ws_to_onpageshow;
    tab_worker.port.on("detach", function () {
      ws.onmessage = null;  // ('message', ws_to_onpageshow);
    });

    function ws_to_onpageshow(data) {
      console.log("websocket - to - main.js - to - clientpage(onPageshow.js)", data.data);
      var payload = data.data;
      tab_worker.port.emit('websocket_to_client', payload);
      ws.send(payload);
    }

  }
});