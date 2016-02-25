// ==UserScript==
// @name        ControlZWeb
// @namespace   https://www.pushvote.com
// @description Brought to you by the PushVote Project.
// @version     1
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @resource        YOUR_CSS data/op/Styles.css
// @require  data/libs/polyfill.js
// @require  data/libs/uuid.js
// @require  data/libs/localforage.js
// @require  data/op/Events.js
// @require  data/op/Functions.js
// @require  data/op/Pagemod.js
// ==/UserScript==
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

var cssTxt  = GM_getResourceText ("YOUR_CSS");
GM_addStyle (cssTxt);