// ==UserScript==
// @name         ReTube Settings
// @version      1.0.0
// @description  Helper script for changing ReTube's settings
// @author       TheMaking <themaking64@cock.li>
// @license      Unlicense
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/dmkng/ReTube/master/ReTubeSettings.meta.js
// @downloadURL  https://raw.githubusercontent.com/dmkng/ReTube/master/ReTubeSettings.user.js
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    "use strict";

    const roundthumb = unsafeWindow.localStorage.getItem("retube.roundthumb") || "0";
    const oldicons = unsafeWindow.localStorage.getItem("retube.oldicons") || "0";
    const animlike = unsafeWindow.localStorage.getItem("retube.animlike") || "1";

    GM_registerMenuCommand(roundthumb === "1" ? "Disable rounded thumbnails" : "Enable rounded thumbnails", function() {
        unsafeWindow.localStorage.setItem("retube.roundthumb", roundthumb === "1" ? "0" : "1");
        unsafeWindow.location.reload();
    });

    GM_registerMenuCommand(oldicons === "1" ? "Disable old icons" : "Enable old icons", function() {
        unsafeWindow.localStorage.setItem("retube.oldicons", oldicons === "1" ? "0" : "1");
        unsafeWindow.location.reload();
    });

    if(oldicons === "0") {
        GM_registerMenuCommand(animlike === "1" ? "Disable like animation" : "Enable like animation", function() {
            unsafeWindow.localStorage.setItem("retube.animlike", animlike === "1" ? "0" : "1");
            unsafeWindow.location.reload();
        });
    }
})();
