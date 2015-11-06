/*SPFML v1.0*/
/*jslint browser: true, nomen: true, regexp: true, newcap: true*/
/*global SP, _spPageContextInfo, lazyLoad*/
(function () {
    "use strict";

    /* version is simple represented by a folder with same name under /siteassets/modules/ */
    var VERSION = "v1.0",

        /* dependencies, structure can be flexable, root folder is /siteassets/modules/[version]/ */
        LIB = {
            REQUIREJS: "lib/require.js",
            TEXT: "lib/text.js",
            domReady: "lib/require.js",
            SHARED: {
                JS: "lib/sd-shared.js",
                CSS: "css/sd-shared.css"
            },
            JQUERY_POPUP: {
                JS: 'lib/jquery.magnific-popup.min.js',
                CSS: 'css/jquery.magnific-popup.css'
            }
        },

        /* modules */
        modules = [{
            name: "RequireJS",
            rule: /\/SitePages\/Home1.aspx/i,
            area: "#contentBox",
            css: [LIB.SHARED.CSS],
            js: {
                required: [LIB.REQUIREJS, LIB.SHARED.JS],
                core: ["appInit.js"]
            }
        }, {
            name: "ImageDemo",
            rule: /\/Lists\/ImageDemo\/(New|Edit|Disp)Form.aspx/i,
            area: "#contentBox",
            css: [LIB.SHARED.CSS, LIB.JQUERY_POPUP.CSS],
            js: {
                required: [LIB.SHARED.JS, LIB.JQUERY_POPUP.JS],
                core: ["ImageDemo/custom.js"]
            }
        }];



   /* core functions, DO NOT modify if you don't understand them well. */

    function loadAssets(module) {

        function map(pathes) {
            var root = (_spPageContextInfo.webServerRelativeUrl === "/" ? "" : _spPageContextInfo.webServerRelativeUrl) + "/siteassets/modules/" + VERSION + "/",
                i = pathes.length - 1;

            for (i; i >= 0; i -= 1) {
                pathes[i] = root + pathes[i];
            }

            return pathes;
        }

        function loadCoreJs() {
            if (typeof module.js.core !== "undefined") {
                lazyLoad.js(map(module.js.core));
            }
        }

        function load() {
            if (typeof module.css !== "undefined") {
                lazyLoad.css(map(module.css));
            }
            if (typeof module.js.required !== "undefined") {
                lazyLoad.js(map(module.js.required), loadCoreJs);
            } else {
                loadCoreJs();
            }
        }

        function ensure() {
            if (typeof _spPageContextInfo !== "undefined") {
                load();
            } else {
                setTimeout(ensure, 100);
            }
        }

        ensure();
    }
    
    function initModule(module) {
        function hideArea(area) {
            var css = area + " { display:none; }",
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }

        function showLoadingDialog() {
            if (typeof window.ExecuteOrDelayUntilScriptLoaded !== "undefined" && document.body !== null) {
                window.ExecuteOrDelayUntilScriptLoaded(function () {
                    SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
                }, "sp.ui.dialog.js");
            } else {
                setTimeout(showLoadingDialog, 100);
            }
        }

        if (typeof module.area !== "undefined" && module.area !== null) {
            hideArea(module.area);
        }

        showLoadingDialog();
        loadAssets(module);
    }
    function init() {
        var path = window.location.href,
            i = modules.length - 1,
            module;

        for (i; i >= 0; i -= 1) {
            module = modules[i];
            if (module.rule.test(path)) {
                initModule(module);
            }
        }
    }
    
    /* this lazyLoad is the not offical version(but we need this), for details please refer, https://github.com/rgrove/lazyload/pull/13 */
    /*jslint ignore lazyLoad warnings */
    var lazyLoad = (function (j) { var g, h, b = {}, e = 0, f = { css: [], js: [] }, m = j.styleSheets; function l(q, p) { var r = j.createElement(q), o; for (o in p) { if (p.hasOwnProperty(o)) { r.setAttribute(o, p[o]) } } return r } function i(o) { var r = b[o], s, q; if (r) { s = r.callback; q = r.urls; q.shift(); e = 0; if (!q.length) { s && s.call(r.context, r.obj); b[o] = null; f[o].length && k(o) } } } function c() { var o = navigator.userAgent; g = { async: j.createElement("script").async === true }; (g.webkit = /AppleWebKit\//.test(o)) || (g.ie = /MSIE/.test(o)) || (g.opera = /Opera/.test(o)) || (g.gecko = /Gecko\//.test(o)) || (g.unknown = true) } var n = { Version: function () { var o = 999; if (navigator.appVersion.indexOf("MSIE") != -1) { o = parseFloat(navigator.appVersion.split("MSIE")[1]) } return o } }; function k(A, z, B, w, s) { var u = function () { i(A) }, C = A === "css", q = [], v, x, t, r, y, o; g || c(); if (z) { z = typeof z === "string" ? [z] : z.concat(); if (C || g.async || g.gecko || g.opera) { f[A].push({ urls: z, callback: B, obj: w, context: s }) } else { for (v = 0, x = z.length; v < x; ++v) { f[A].push({ urls: [z[v]], callback: v === x - 1 ? B : null, obj: w, context: s }) } } } if (b[A] || !(r = b[A] = f[A].shift())) { return } h || (h = j.head || j.getElementsByTagName("head")[0]); y = r.urls; for (v = 0, x = y.length; v < x; ++v) { o = y[v]; if (C) { t = g.gecko ? l("style") : l("link", { href: o, rel: "stylesheet" }) } else { t = l("script", { src: o }); t.async = false } t.className = "lazyload"; t.setAttribute("charset", "utf-8"); if (g.ie && !C && n.Version() < 10) { t.onreadystatechange = function () { if (/loaded|complete/.test(t.readyState)) { t.onreadystatechange = null; u() } } } else { if (C && (g.gecko || g.webkit)) { if (g.webkit) { r.urls[v] = t.href; d() } else { t.innerHTML = '@import "' + o + '";'; a(t) } } else { t.onload = t.onerror = u } } q.push(t) } for (v = 0, x = q.length; v < x; ++v) { h.appendChild(q[v]) } } function a(q) { var p; try { p = !!q.sheet.cssRules } catch (o) { e += 1; if (e < 200) { setTimeout(function () { a(q) }, 50) } else { p && i("css") } return } i("css") } function d() { var p = b.css, o; if (p) { o = m.length; while (--o >= 0) { if (m[o].href === p.urls[0]) { i("css"); break } } e += 1; if (p) { if (e < 200) { setTimeout(d, 50) } else { i("css") } } } } return { css: function (q, r, p, o) { k("css", q, r, p, o) }, js: function (q, r, p, o) { k("js", q, r, p, o) } } })(document);
    
    init();

}());