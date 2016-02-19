// ==UserScript==
// @name        OrangePeelz
// @namespace   https://www.pushvote.com
// @description Brought to you by the PushVote Project.
// @version     1
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @resource        YOUR_CSS data/op/OrangePeel.css
// @require  data/libs/timeuuid.js
// @require  data/libs/localforage.js
// @require  data/op/OrangePeel_Events.js
// @require  data/op/OrangePeel_Functions.js
// @require  data/op/OrangePeel_Pageshow.js
// ==/UserScript==
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

var cssTxt  = GM_getResourceText ("YOUR_CSS");
GM_addStyle (cssTxt);