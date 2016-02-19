/**
 * Created by Void on 11/21/2015.
 */
//var gp = require("sdk/preferences/service");
//gp.set("devtools.storage.enabled", true); //enable storage view in devtools
//gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on


var data = require("sdk/self").data;


var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: "*",
    contentStyleFile: data.url("./op/OrangePeel.css"),
    contentScriptFile: [
        data.url("./libs/timeuuid.js"),
        data.url("./libs/localforage.js"),
        data.url("./op/OrangePeel_Events.js"),
        data.url("./op/OrangePeel_Functions.js"),
        data.url("./op/OrangePeel_Pageshow.js")
    ],
    contentScriptWhen: "start"
});