var { setTimeout, clearTimeout } = require("sdk/timers");
var windows = require("sdk/windows").browserWindows;
var { viewFor } = require("sdk/view/core");
let aWindow = viewFor(windows.activeWindow);

exports = module.exports = function (ws_host) {
    var attempts = 1;
    var reconnectTimer;

    function websocket_connect() {

       var ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket(ws_host, ['13', '8']);
        //ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket("wss://scooby-boxy.rhcloud.com:8443");
        //var ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket(ws_host, ['13', '8']);
        //ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket("ws://73.158.90.22:45231", ['13', '8']);

        ws.onopen = function () {
            console.log("WebSocket Server Is Now Connected!");
            clearTimeout(reconnectTimer);
        };

        ws.onclose = function () {
            console.log("WebSocket.js Connection failed and closed");
            if (attempts >= 30) {
                console.log("We have attempted over 30 times, resetting attempts interval:", attempts);
                attempts = 1;
            }

            var RandomWaitTime = 1000;
            console.log("WebSocket.js Reconnecting in: " + RandomWaitTime);
            reconnectTimer = setTimeout(function () {
                console.log("Reconnecting Now!");
                websocket_connect()
            }, RandomWaitTime);
        };

        return ws;
    }

    return websocket_connect();
};


