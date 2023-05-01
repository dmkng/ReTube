// ==UserScript==
// @name         ReTube
// @version      1.1.0
// @description  Brings back older YouTube design using as little CSS/JS as possible
// @author       TheMaking (themaking64@cock.li)
// @license      Unlicense
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/dmkng/ReTube/master/ReTube.meta.js
// @downloadURL  https://raw.githubusercontent.com/dmkng/ReTube/master/ReTube.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Regular config keys.
const CONFIGS = {
    BUTTON_REWORK: true
};

// Experiment flags.
const EXPFLAGS = {
    web_button_rework: true,
    web_modern_buttons: false,
    kevlar_system_icons: true,
    kevlar_updated_icons: false,
    kevlar_watch_color_update: false,
    kevlar_watch_metadata_refresh: false,
    web_snackbar_ui_refresh: false,
    web_rounded_thumbnails: false,
    web_rounded_containers: true,
    web_darker_dark_theme: false
};

// Player flags
// !!! USE STRINGS FOR VALUES !!!
// For example: "true" instead of true
const PLYRFLAGS = {
    web_player_move_autonav_toggle: "false"
};

class YTP {
    static observer = new MutationObserver(YTP.onNewScript);

    static _config = {};

    static start() {
        // Matches button sizes
        // Fixes button positions
        // Fixes download button background
        // Fixes tooltips
        // Removes UI shrinking to adjust to the video size
        // Fixes channel name and icon
        // Fixes Return YouTube Dislike ratio bar
        var style = document.createElement("style");
        style.innerHTML = "ytd-menu-renderer .yt-spec-button-shape-next--icon-only-default,ytd-menu-renderer yt-icon-button{width:36px!important;height:36px!important}#menu.ytd-video-primary-info-renderer{top:1px!important}ytd-download-button-renderer button:not(:hover){background-color:transparent!important}ytd-menu-renderer.ytd-video-primary-info-renderer{overflow-y:visible!important}#primary{max-width:none!important}#upload-info.ytd-video-owner-renderer{margin-left:0.5rem}#avatar.ytd-video-owner-renderer{width:46px!important;height:46px!important}#channel-name.ytd-video-owner-renderer{font-size:1.5rem!important;}.ryd-tooltip{position:absolute;top:43px}";
        document.head.appendChild(style);

        YTP.observer.observe(document, { subtree: true, childList: true });
    }

    static stop() {
        YTP.observer.disconnect();
    }

    static forceStyle() {
        // Fixes margin above video title
        document.querySelector("ytd-watch-flexy").removeAttribute("rounded-info-panel");
        // Fixes channel icon
        document.querySelector("#avatar.ytd-video-owner-renderer").width = "46";

        YTP.observer = new MutationObserver(YTP.onChange);
        YTP.observer.observe(document.querySelector("#page-manager"), { subtree: true, childList: true });
    }

    static onChange(mutations) {
        // Fixes like/dislike buttons
        var like = document.querySelector(".yt-spec-button-shape-next--segmented-start");
        if(like) {
            like.classList.remove("yt-spec-button-shape-next--segmented-start");
            like.classList.replace("yt-spec-button-shape-next--tonal", "yt-spec-button-shape-next--text");

            var dislike = document.querySelector(".yt-spec-button-shape-next--segmented-end");
            if(dislike) {
                dislike.classList.remove("yt-spec-button-shape-next--segmented-end");
                dislike.classList.replace("yt-spec-button-shape-next--tonal", "yt-spec-button-shape-next--text");

                dislike.classList.replace("yt-spec-button-shape-next--icon-only-default", "yt-spec-button-shape-next--icon-leading");
                var text = document.createElement("div");
                text.className = "cbox yt-spec-button-shape-next--button-text-content";
                text.innerHTML = '<span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">0</span>';
                dislike.insertBefore(text, dislike.lastChild);
            }
        }

        // Fixes Return YouTube Dislike ratio bar
        var bar = document.querySelector(".ryd-tooltip");
        if(bar) {
            bar.style.left = document.querySelector(".ytd-video-primary-info-renderer #top-level-buttons-computed").offsetLeft + "px";
        }
    }

    static onNewScript(mutations) {
        for(var mut of mutations) {
            for(var node of mut.addedNodes) {
                YTP.bruteforce();
            }
        }

        YTP.onChange();
    }

    static bruteforce() {
        if(!window.yt || !window.yt.config_) return;

        YTP.mergeDeep(window.yt.config_, YTP._config);
    }

    static isObject(item) {
        return (item && typeof item === "object" && !Array.isArray(item));
    }

    static mergeDeep(target, ...sources) {
        if(!sources.length) return target;
        const source = sources.shift();

        if(YTP.isObject(target) && YTP.isObject(source)) {
            for(const key in source) {
                if(YTP.isObject(source[key])) {
                    if(!target[key]) Object.assign(target, { [key]: {} });
                    YTP.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return YTP.mergeDeep(target, ...sources);
    }

    static setCfgMulti(configs) {
        YTP.mergeDeep(YTP._config, configs);
    }

    static setExpMulti(exps) {
        if(!("EXPERIMENT_FLAGS" in YTP._config)) YTP._config.EXPERIMENT_FLAGS = {};

        YTP.mergeDeep(YTP._config.EXPERIMENT_FLAGS, exps);
    }

    static decodePlyrFlags(flags) {
        var obj = {},
            dflags = flags.split("&");

        for(var i = 0; i < dflags.length; i++) {
            var dflag = dflags[i].split("=");
            obj[dflag[0]] = dflag[1];
        }

        return obj;
    }

    static encodePlyrFlags(flags) {
        var keys = Object.keys(flags),
            response = "";

        for(var i = 0; i < keys.length; i++) {
            if(i > 0) {
                response += "&";
            }
            response += keys[i] + "=" + flags[keys[i]];
        }

        return response;
    }

    static setPlyrFlags(flags) {
        if(!window.yt) return;
        if(!window.yt.config_) return;
        if(!window.yt.config_.WEB_PLAYER_CONTEXT_CONFIGS) return;
        var conCfgs = window.yt.config_.WEB_PLAYER_CONTEXT_CONFIGS;
        if(!("WEB_PLAYER_CONTEXT_CONFIGS" in YTP._config)) YTP._config.WEB_PLAYER_CONTEXT_CONFIGS = {};

        for(var cfg in conCfgs) {
            var dflags = YTP.decodePlyrFlags(conCfgs[cfg].serializedExperimentFlags);
            YTP.mergeDeep(dflags, flags);
            YTP._config.WEB_PLAYER_CONTEXT_CONFIGS[cfg] = {
                serializedExperimentFlags: YTP.encodePlyrFlags(dflags)
            }
        }
    }
}

window.addEventListener("yt-page-data-updated", function tmp() {
    YTP.stop();
    YTP.forceStyle();
    window.removeEventListener("yt-page-date-updated", tmp);
});

window.addEventListener("DOMContentLoaded", function() {
    YTP.start();

    YTP.setCfgMulti(CONFIGS);
    YTP.setExpMulti(EXPFLAGS);
    YTP.setPlyrFlags(PLYRFLAGS);
});
