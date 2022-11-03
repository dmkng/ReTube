// ==UserScript==
// @name         ReTube
// @version      1.0.0
// @description  Brings back older YouTube design using as little CSS/JS as possible
// @author       TheMaking (themaking64@cock.li)
// @license      Unlicense
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
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
    static observer = new MutationObserver(this.onNewScript);

    static _config = {};

    static isObject(item) {
        return (item && typeof item === "object" && !Array.isArray(item));
    }

    static start() {
        // Matches button sizes
        // Removes button margin
        // Fixes tooltips
        // Removes UI shrinking to adjust to the video size
        // Fixes Return YouTube Dislike ratio bar
        var style = document.createElement("style");
        style.innerHTML = "ytd-button-renderer.ytd-menu-renderer button{width:36px;height:36px;}ytd-download-button-renderer button{width:36px!important;height:36px!important;}.ytd-video-primary-info-renderer yt-icon-button{width:36px!important;height:36px!important;}#menu.ytd-video-primary-info-renderer{top:0!important;}ytd-menu-renderer.ytd-video-primary-info-renderer{overflow-y:visible!important;}#primary{max-width:none!important;}#menu-container{display:block!important;}.ryd-tooltip{margin-top:-3px;}";
        document.head.appendChild(style);

        this.observer.observe(document, { subtree: true, childList: true });
    }

    static stop() {
        this.observer.disconnect();
    }

    static forceStyle() {
        // Fixes channel icon
        document.querySelector("ytd-video-owner-renderer").removeAttribute("modern-metapanel");
        // Fixes margin above video title
        document.querySelector("ytd-watch-flexy").removeAttribute("rounded-info-panel");

        this.observer = new MutationObserver(this.onChange);
        this.observer.observe(document.querySelector("#page-manager"), { subtree: true, childList: true });
    }

    static onChange() {
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
                text.innerHTML = '<span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text"></span>';
                dislike.insertBefore(text, dislike.lastChild);
            }
        } else {
            like = document.querySelector("ytd-segmented-like-dislike-button-renderer");
        }

        // Fixes Return YouTube Dislike ratio bar
        var bar = document.querySelector(".ryd-tooltip");
        if(bar) {
            bar.style.left = (like.offsetLeft - 4) + "px";
        }
    }

    static mergeDeep(target, ...sources) {
        if(!sources.length) return target;
        const source = sources.shift();

        if(this.isObject(target) && this.isObject(source)) {
            for(const key in source) {
                if(this.isObject(source[key])) {
                    if(!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    }

    static bruteforce() {
        if(!window.yt) return;
        if(!window.yt.config_) return;

        this.mergeDeep(window.yt.config_, this._config);
    }

    static onNewScript(mutations) {
        for(var mut of mutations) {
            for(var node of mut.addedNodes) {
                YTP.bruteforce();
            }
        }

        this.onChange();
    }

    static setCfg(name, value) {
        this._config[name] = value;
    }

    static setCfgMulti(configs) {
        this.mergeDeep(this._config, configs);
    }

    static setExp(name, value) {
        if(!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this._config.EXPERIMENT_FLAGS[name] = value;
    }

    static setExpMulti(exps) {
        if(!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this.mergeDeep(this._config.EXPERIMENT_FLAGS, exps);
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
        if(!("WEB_PLAYER_CONTEXT_CONFIGS" in this._config)) this._config.WEB_PLAYER_CONTEXT_CONFIGS = {};

        for(var cfg in conCfgs) {
            var dflags = this.decodePlyrFlags(conCfgs[cfg].serializedExperimentFlags);
            this.mergeDeep(dflags, flags);
            this._config.WEB_PLAYER_CONTEXT_CONFIGS[cfg] = {
                serializedExperimentFlags: this.encodePlyrFlags(dflags)
            }
        }
    }
}

window.addEventListener("yt-page-data-updated", function tmp() {
    YTP.stop();
    YTP.forceStyle();
    window.removeEventListener("yt-page-date-updated", tmp);
});

YTP.start();

YTP.setCfgMulti(CONFIGS);
YTP.setExpMulti(EXPFLAGS);
YTP.setPlyrFlags(PLYRFLAGS);
