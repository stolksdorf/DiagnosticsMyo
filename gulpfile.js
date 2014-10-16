"use strict";

var recoil = require("./recoil.js");

/**
 * Build Config
 */
var gulp = recoil.gulp({
    entryPoints: ["./client/diagnostics"],
    DEV: true,
    buildPath: "./build/",

    pageTemplate: "./client/template.hbs",

    //iconsPath: "./icons",

    //projectModules: ["./node_modules/emerald", "./node_modules/palette"],
    assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", '*.ttf'],

    serverWatchPaths: ["server"],
    serverScript: "./server.js",

    cdn: {
        "react-addons": ["window.React.addons", ""],
        "react": ["window.React", "<script src='//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react-with-addons.js'></script>"],
        "jquery": ["window.jQuery", "<script src='//code.jquery.com/jquery-1.11.0.min.js'></script>"],
        "underscore": ["window._", "<script src='//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js'></script>"],
        "moment": ["window.moment", "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.7.0/moment.min.js'></script>"],
        "ws": ["WebSocket", ""],
    },
    libs: [],
});

