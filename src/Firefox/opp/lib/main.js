/**
 * Created by Void on 11/21/2015.
 */
var gp = require("sdk/preferences/service");
gp.set("devtools.storage.enabled", true); //enable storage view in devtools
gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on


var preferences = require("sdk/simple-prefs").prefs;

var { ToggleButton } = require("sdk/ui/button/toggle");

var button = ToggleButton({
    id: "my-button1",
    label: "my button1",
    icon: "./icons/16.png",
    //badge: 0,
    badgeColor: "#00AAAA"
});

var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: "*",
    attachTo: ["top", "frame", "existing"],
    contentScriptWhen: "ready",
    contentStyleFile: ["./op/Styles.css"],
    contentScriptFile: [
        "./libs/uuid.js",
        "./libs/localforage.js",
        "./op/Events.js",
        "./op/Functions.js",
        "./op/Pagemod.js"
    ],
    onAttach: function (worker) {

        if (preferences["Enabled"]) { //preferences
            worker.port.emit("Enable_Listeners");
        }
        button.on("click", handleChange);

        function handleChange(state) {
            if (state.checked) {
                button.badgeColor = "#AA00AA";
                worker.port.emit("Enable_Listeners");
                preferences["Enabled"] = true;
            }
            else {
                button.badgeColor = "#00AAAA";
                worker.port.emit("Disable_Listeners");
                preferences["Enabled"] = false;
            }
        }
    }
});