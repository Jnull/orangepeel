/**
 * Created by Void on 11/21/2015.
 */
var gp = require("sdk/preferences/service");
gp.set("devtools.storage.enabled", true); //enable storage view in devtools
gp.set("extensions.sdk.console.logLevel", "all"); //turn sdk logging on


var data = require("sdk/self").data;


var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: "*",
    attachTo: ["top"],
    contentScriptWhen: "ready",
    contentStyleFile: data.url("./op/Styles.css"),
    contentScriptFile: [
        data.url("./libs/polyfill.js"),  //Object.assign() && Array.from() !!
        data.url("./libs/uuid.js"),
        data.url("./libs/localforage.js"),
        data.url("./op/Events.js"),
        data.url("./op/Functions.js"),
        data.url("./op/Pagemod.js")
    ]
});