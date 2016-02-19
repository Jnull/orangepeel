/**
 * Created by Void on 11/21/2015.
 */
//var gp = require("sdk/preferences/service");
//gp.set("devtools.storage.enabled", true); //enable storage view in devtools
//gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on

var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: "*",
    contentStyleFile: ["./op/OrangePeel.css"],
    contentScriptFile: [
        "./libs/timeuuid.js",
        "./libs/localforage.js",
        "./op/OrangePeel_Events.js",
        "./op/OrangePeel_Functions.js",
        "./op/OrangePeel_Pageshow.js"
    ],
    contentScriptWhen: "start"
});