/**
 * Created by Void on 11/21/2015.
 */
//var gp = require("sdk/preferences/service");
//gp.set("devtools.storage.enabled", true); //enable storage view in devtools
//gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on

var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: "*",
    contentScriptWhen: "ready",
    attachTo: ["top"],
    contentStyleFile: ["./op/Styles.css"],
    contentScriptFile: [
        "./libs/uuid.js",
        "./libs/localforage.js",
        "./op/Events.js",
        "./op/Functions.js",
        "./op/Pagemod.js"
    ]
});