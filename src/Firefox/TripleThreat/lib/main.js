var Music = require("./media/audio");
var gp = require("sdk/preferences/service");
//var { setTimeout, clearTimeout } = require("sdk/timers");
/*
 gp.set("security.csp.enable", false); //disable content security policy - https://developer.mozilla.org/en-US/docs/Web/Security/CSP
 */
gp.set("devtools.storage.enabled", true); //enable storage view in devtools
gp.set("xpinstall.signatures.required", false); //Allow unsigned xpi install
gp.set("reader.parse-on-load.enabled", false); //Turn annoying reader thing off
gp.set("security.mixed_content.block_active_content", false); //cors enabled
gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on

gp.set("devtools.chrome.enabled", true); //turn browser console insert on
gp.set("loop.enabled", false); //turn hello loop firefox off
var self = require("sdk/self");
//Styles
var { viewFor } = require("sdk/view/core");
var { attach, detach } = require('sdk/content/mod');
var Style = require("sdk/stylesheet/style").Style;
var tabs = require("sdk/tabs");
//End Styles.

var windows = require("sdk/windows").browserWindows;
let aWindow = viewFor(windows.activeWindow);
var { ToggleButton } = require("sdk/ui/button/toggle");
var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");

var pageMod = require("sdk/page-mod");


//Imported frame
//var { Frame } = require("sdk/ui/frame");
//var { Toolbar } = require("sdk/ui/toolbar");
const {Cc,Ci} = require("chrome");
var currentWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");

//Change Sidebar width:
const { WindowTracker } = require('sdk/deprecated/window-utils');
const { isBrowser, getMostRecentBrowserWindow, xwindows, isWindowPrivate } = require('sdk/window/utils');
WindowTracker({
    onTrack: function (xWindow) {
        if (!isBrowser(xWindow))
            return;
        let sidebar = xWindow.document.getElementById('sidebar');
        sidebar.setAttribute('style', 'float: left; min-width: 0%; top: 100px; width: 500px; max-width: 100%;');
    }
});// End Sidebar width


var OrangeButton = ToggleButton({
    id: "orange-peel-enabled",
    label: "Enable OrangePeel",
    icon: {
        "16": "./toolbar/icons/enable-16.png",
        "32": "./toolbar/icons/enable-32.png"
    },
    disabled: false,
    badge: 0,
    badgeColor: "#00AAAA",
    onClick: changed
});


function changed(state) {
    //OrangeButton.state(tab, {"badge": OrangeButton.state(tab).badge = +1}); //increment action icon bade by +1
    OrangeButton.badge = state.badge + 1;
    if (state.checked) {
        Music.mario.coin();
        OrangeButton.badgeColor = "#AA00AA";
    }

    else {
        Music.mario.kick();
        OrangeButton.badgeColor = "#00AAAA";
    }
}

var toolbar_frame = new Frame({
    url: "./toolbar/frame.html"
});

//TOOLBAR GETS LOADED ONCE
var main_toolbar = Toolbar({
    title: "Delete Rules",
    items: [toolbar_frame]
    ,
    onShow: function (e) {
        console.log("toolbar showing");
    },
    onHide: function (e) {
        console.log("toolbar hiding");
    },
    onDetach: function () {
        console.log("Toolbar has been detached!");
    },
    onAttach: function (e) {
        console.log("toolbar has been attached")
    }

});


//websockets connections are starting up and readying to be received .
if (!ws || ws.readyState !== 0 || 1) { //0 = connecting, 1 = open, 2 = closing, 3 = closed
    /////////////////////////////var ws = require("./net/websocket")('ws://10.0.0.158:8080');
  var ws = require("./net/websocket")('wss://scooby-boxy.rhcloud.com:8443');
    //var ws = require("./net/websocket")('ws://10.0.0.158:8080');
    /var ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket("wss://scooby-boxy.rhcloud.com:8443");
    //var ws = new aWindow.Services.appShell.hiddenDOMWindow.WebSocket('ws://10.0.0.158:8080', ['13', '8']);
    aWindow.op_websocket = ws;
}

var sidebar = require("sdk/ui/sidebar").Sidebar({
    id: 'pushvote',
    title: 'PushVote',
    url: "./sidebar/chat/index.html",
    onAttach: function (sb_worker1) {
    },
    onReady: function (sb_worker) {
        console.log('sidebar is ready!');

        tabs.on('ready', orangepeel); //scripts and styles are still loading.
        tabs.on('ready', toolbar);
        tabs.on('open', function (atab) {
            atab.off('ready', toolbar);
        });
        tabs.on('activate', function (atab) {
            atab.on('ready', toolbar);
        });

        function toolbar(tab) {
            let w0 = tab.attach({
                //load all js into toolbar
                contentScriptFile: [
                    "./libs/localforage.js",
                    "./libs/fingerprint.js",
                    "./op/OrangePeel_Functions.js",
                    "./toolbar/all_in_one_rules.js"]
            });


            tab.on('load', function (atab) { //scripts and styles fully loaded

            });

            tab.on('activate', function (atab) {
                toolbar_frame.on('message', frame_toolbar_messages);
            });
            tab.on('deactivate', function (atab) {
                toolbar_frame.off('message', frame_toolbar_messages);
                this.off('message', frame_toolbar_messages); //experimental - Trying to unload toolbar worker.
            });
            //toolbar frame buttons send messages to these tab worker message listeners
            toolbar_frame.on("message", frame_toolbar_messages);
            toolbar_frame.on("detach", function () {
                this.off('message', frame_toolbar_messages); //experimental - Trying to unload toolbar worker.
                console.log("frame has been detached");
            });

            function frame_toolbar_messages(incoming) {
                var message = incoming.data;
                if (w0) {
                    try {
                        //toolbar messages to
                        w0.port.emit("activate_toolbar_all_in_one_rules_js", message);
                    }
                    catch (e) {
                        this.off('message', frame_toolbar_messages); //when refreshing a page the load events get loaded multiple times.
                        console.log("There was a problem with the frame_toolbar_message_worker in main.js");
                        console.log("This is usually just a old toolbar worker that has been detatched");
                    }
                }
            }
        }

        //click highlight voting
        var selection = require("sdk/selection");
        selection.on('select', function () {
            if (selection.text) {
                sb_worker.port.emit("User_Selection", selection.text);
            }
        });


        sb_worker.port.on('sidebar_to_websocket', function (incoming_data) {
            var payload = JSON.stringify(incoming_data);
            console.log('main.js - side bar message sending out to websocket', payload);
            ws.send(payload); //sending to server.
        });

        function incoming_ws_message1(data) {
            // console.log("websocket - to - main.js - to - clientpage(onPageshow.js)", (data.data));
            var payload = data.data;
            //tab_worker.port.emit('websocket_to_client', payload);
            sb_worker.port.emit('to_sidebar', payload);
        }

        ws.addEventListener('message', incoming_ws_message1);

        function orangepeel(tab) {
            var lowLevelTab = viewFor(tab);
            var style = Style({uri: './op/OrangePeel.css'});
            attach(style, lowLevelTab);
            var tab_worker = tab.attach({
                contentScriptWhen: 'start',
                contentScriptFile: [
                    "./libs/timeuuid.js",
                    "./libs/localforage.js",
                    "./libs/fingerprint.js",
                    "./op/OrangePeel_Functions.js",
                    "./op/OrangePeel_Events.js",
                    "./op/OrangePeel_onPageshow.js"
                ]
            });


            toolbar_frame.postMessage("dummy_request_here", toolbar_frame.url); //toolbar_frame.url is sending to a specific window //problem is when you first start up with jpm, the toolbar isn't activated until reload

            //only let under 10 rtc connections!
          if (!rtc_obj || rtc_obj.aDC.length + rtc_obj.bDC.length < 10 ) {
              var rtc_obj = require("./net/webrtc")(ws, tab_worker);
          }
            //rtc_obj webrtc
            //ws websocket
            //sb_worker
            //tab_worker

            /*
             if (ws.readyState == 2 || 3) { //0 = connecting, 1 = open, 2 = closing, 3 = closed
             console.log("main.js - something is happening to websocket!");
             ws = require("./net/websocket")('ws://10.0.0.158:8080');
             }
             */
            //force toolbar startup and ready for incoming button commands to be received.
            //toolbar_frame.postMessage("dummy_request_here", toolbar_frame.url); //toolbar_frame.url is sending to a specific window //problem is when you first start up with jpm, the toolbar isn't activated until reload

            //Requesting Client Activation Through Server


            tab_worker.port.on('client_to_websocket', function (data) {
                var payload = JSON.stringify(data);
                //console.log("clientpage(onPageshow.js) - to - main.js - to - websocket", data);
                ws.send(payload); //sending to server.

                rtc_obj = rtc_obj || [];
                //sending to all rtc connections
                rtc_obj.aDC.forEach(function (v, i, a) {
                    if (v.readyState === 'open') {
                        v.send(payload);
                    } else {
                        a.splice(i, 1);
                    }
                });
                rtc_obj.bDC.forEach(function (v, i, a) {
                    if (v.readyState === 'open') {
                        v.send(payload);
                    } else {
                        a.splice(i, 1);
                    }
                });

            });
            //WebSocket to ClientPage
            // ws.addEventListener('message', ws_to_onpageshow);
            ws.onmessage = ws_to_onpageshow;
            tab_worker.port.on("detach", function () {
                ws.onmessage = null;  // ('message', ws_to_onpageshow);
            });

            function ws_to_onpageshow(data) {
                //console.log("websocket - to - main.js - to - clientpage(onPageshow.js)", data.data);
                var payload = data.data;
                tab_worker.port.emit('websocket_to_client', payload);
                ws.send(payload);
                //sb_worker.port.emit('to_sidebar', payload);
            }
        }

    },

    onDetach: function () {
        // console.log("sidebar detaching");
    },
    onShow: function (sb_worker2) {
        // console.log("sidebar showing");
        pageMod.PageMod({
            include: "*",
            contentScriptFile: "./pagemod/pagemod.js",
            contentScriptWhen: "start",
            onAttach: function (worker) {
                worker.port.on('pagemod_to_ws', function (incoming_data) {
                    var payload = JSON.stringify(incoming_data);
                    console.log('main.js - side bar message sending out to websocket', payload);
                    ws.send(payload); //sending to server.
                });

                var outgoing_data = {
                    message: "client_requesting_server_activation"
                    , hostname: null
                    , username: null
                    , fingerprint: null
                    , email: null
                    , url: null
                    , server_insertion_time: null
                    , client_creation_time: null
                    , payload: {
                        master_object: {}
                        , xpath_object: {}
                        , xpath: {}
                    },
                    status: "main.js is requesting server activation"
                };
               // ws.send(JSON.stringify(outgoing_data));  //request delete rules for domain.

            }
        });
    },
    onHide: function () {
        // console.log("sidebar hiding");
    }
}).show();

exports.main = function (options, callbacks) {

};

exports.onUnload = function (reason) {
    //tabs.off('ready', orangepeel);
    tabs.off('ready', toolbar);

    //TODO make this a function to allow unloading
    tabs.off('open', function (atab) {
        atab.off('ready', toolbar);
    });

    //TODO make this a function to allow unloading
    tabs.off('activate', function (atab) {
        atab.on('ready', toolbar);
    });
};
