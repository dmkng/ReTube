// ==UserScript==
// @name         ReTube
// @version      1.4.0
// @description  Brings back older YouTube design using as little CSS/JS as possible
// @author       TheMaking <themaking64@cock.li>
// @license      Unlicense
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/dmkng/ReTube/master/ReTube.meta.js
// @downloadURL  https://raw.githubusercontent.com/dmkng/ReTube/master/ReTube.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    const roundthumb = window.localStorage.getItem("retube.roundthumb") || "0";
    const oldicons = window.localStorage.getItem("retube.oldicons") || "0";
    const animlike = window.localStorage.getItem("retube.animlike") || "1";

    // Regular config keys
    const CONFIGS = {
        BUTTON_REWORK: true
    };

    // Experiment flags
    const EXPFLAGS = {
        kevlar_refresh_on_theme_change: false,
        kevlar_system_icons: oldicons === "0",
        kevlar_unavailable_video_error_ui_client: false,
        kevlar_updated_icons: false,
        kevlar_watch_color_update: false,
        kevlar_watch_metadata_refresh: true,
        kevlar_watch_modern_metapanel: false,
        web_amsterdam_playlists: false,
        web_animated_like: oldicons === "0" && animlike === "1",
        web_darker_dark_theme: false,
        web_guide_ui_refresh: false,
        web_modern_buttons: false,
        web_modern_chips: false,
        web_modern_dialogs: false,
        web_modern_playlists: false,
        web_modern_subscribe: false,
        web_rounded_containers: true,
        web_rounded_thumbnails: roundthumb === "1",
        web_sheets_ui_refresh: false,
        web_snackbar_ui_refresh: false
    };

    class YTP {
        static observer = new MutationObserver(YTP.onNewScript);

        static _config = {};

        static start() {
            // Matches button sizes
            // Fixes button positions
            // Fixes download button background
            // Removes UI shrinking to adjust to the video size
            // Fixes Return YouTube Dislike ratio bar
            const style = document.createElement("style");
            style.innerHTML = "ytd-menu-renderer .yt-spec-button-shape-next--icon-only-default,ytd-menu-renderer yt-icon-button{width:36px!important;height:36px!important}#menu.ytd-video-primary-info-renderer{top:1px!important}ytd-download-button-renderer button:not(:hover){background-color:transparent!important}#primary{max-width:none!important}#top-row.ytd-watch-metadata{padding-bottom:8px!important}#actions.ytd-watch-metadata{margin-top:16px}";
            document.head.appendChild(style);

            YTP.observer.observe(document, { subtree: true, childList: true });
        }

        static stop() {
            YTP.observer.disconnect();

            YTP.observer = new MutationObserver(YTP.onChange);
            YTP.observer.observe(document.querySelector("#page-manager"), { subtree: true, childList: true });
        }

        static forceStyle() {
            // Fixes margin above video title
            const info = document.querySelector("ytd-watch-flexy");
            if(info) {
                info.removeAttribute("rounded-info-panel");
            }
        }

        static onChange() {
            // Fixes like/dislike buttons
            const like = document.querySelector(".yt-spec-button-shape-next--segmented-start");
            if(like) {
                like.classList.remove("yt-spec-button-shape-next--segmented-start");
                like.classList.replace("yt-spec-button-shape-next--tonal", "yt-spec-button-shape-next--text");

                const dislike = document.querySelector(".yt-spec-button-shape-next--segmented-end");
                if(dislike) {
                    dislike.classList.remove("yt-spec-button-shape-next--segmented-end");
                    dislike.classList.replace("yt-spec-button-shape-next--tonal", "yt-spec-button-shape-next--text");

                    dislike.classList.replace("yt-spec-button-shape-next--icon-button", "yt-spec-button-shape-next--icon-leading");
                    const text = document.createElement("div");
                    text.className = "cbox yt-spec-button-shape-next--button-text-content";
                    text.innerHTML = '<span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">0</span>';
                    dislike.insertBefore(text, dislike.lastChild);
                }
            }
        }

        static onNewScript(mutations) {
            for(const mut of mutations) {
                for(const node of mut.addedNodes) {
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
            const obj = {}, dflags = flags.split("&");

            for(let i = 0; i < dflags.length; ++i) {
                const dflag = dflags[i].split("=");
                obj[dflag[0]] = dflag[1];
            }

            return obj;
        }

        static encodePlyrFlags(flags) {
            const keys = Object.keys(flags);
            let response = "";

            for(let i = 0; i < keys.length; ++i) {
                if(i !== 0) {
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
            const conCfgs = window.yt.config_.WEB_PLAYER_CONTEXT_CONFIGS;
            if(!("WEB_PLAYER_CONTEXT_CONFIGS" in YTP._config)) YTP._config.WEB_PLAYER_CONTEXT_CONFIGS = {};

            for(const flag in flags) {
                if(flags.hasOwnProperty(flag)) {
                    flags[flag] = flags[flag].toString();
                }
            }

            for(const cfg in conCfgs) {
                const dflags = YTP.decodePlyrFlags(conCfgs[cfg].serializedExperimentFlags);
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

    YTP.setCfgMulti(CONFIGS);
    YTP.setExpMulti(EXPFLAGS);

    window.addEventListener("DOMContentLoaded", function() {
        YTP.start();
        YTP.setPlyrFlags(EXPFLAGS);
    }, true);
})();
