/*
 *  Initialize FrontDoorApp.
 *  1. load RequireJS
 *  2. expose global object: sd
 * 
 *  On the web page, add something like this:
 * 
 *  <div id="appHomeContainer" />
    <script src="/teams/ESSolutionDesign-Staging/SiteAssets/modules/AppInit.js"></script>
    <script>
      sd.loadWebComponent({
        container: "#appHomeContainer",
        componentModule: "component/AppHome",
        componentParams: {}
      });
    </script>
 * 
 */
(function () {
    "use strict";

    var ENV = 'Staging',
        URL_Root = "/teams/ESSD",
        URL_HOME = URL_Root + "/SiteAssets/modules/v1.0",
        URL_REQUIREJS = URL_HOME + "/js/require.js",
        URL_CSS = [URL_HOME + "/css/sd.min.css"],
        //URL_CSS = [URL_HOME + "/css/bootstrap.min.css", URL_HOME + "/css/bootstrap-theme.min.css", URL_HOME + "/css/jasny-bootstrap.min.css", URL_HOME + "/css/bootstrap-multiselect.css",
        //    URL_HOME + "/css/bootstrap-datetimepicker.min.css", URL_HOME + "/css/sd-shared.css", URL_HOME + "/css/select2.css",
        //    URL_HOME + "/css/jquery.dataTables.css", URL_HOME + "/css/jquery.dataTables_themeroller.css", URL_HOME + "/css/jquery-ui.css"],
        REQUIREJS_CONFIG = {
            context: "sd",
            baseUrl: URL_HOME,
            paths: {
                //  follow app directory structure convention
                module: 'module',
                model: 'model',
                util: 'util',
                js: 'js',
                //  SharePoint Runtime and Core
                //  Register any SharePoint Library if it is required to be processed first
                'spruntime_js': "/_layouts/15/sp.runtime",
                'sp_js': "/_layouts/15/sp",

                //  Require JS Plugins, 
                'require': 'js/require',
                'domReady': 'js/domReady', //    For ensuring the dom is loaded
                'text': 'js/require-text.min', //    For Downloading the html templates

                //  Frameworks
                //'jquery': 'js/jquery-1.11.3.min',
                //'jquery-private': 'js/jquery-private',
                'bootstrap': 'js/bootstrap.min',
                "knockout": 'js/knockout-3.3.0',
                'ko': 'js/knockout-3.3.0',
                'webComponentLoader': 'js/webComponentLoader',

                //  Other Plugins, 
                'jasnybs': 'js/jasny-bootstrap.min',
                'popup': "js/jquery.magnific-popup.min", // For image popup display
                'select2': 'js/select2.min', //select2 multipleselect control, https://select2.github.io/
                'datetimepicker': 'js/bootstrap-datetimepicker.min', //datetimepicker control,  https://github.com/Eonasdan/bootstrap-datetimepicker
                'moment': 'js/moment.min',
                "komapping": "js/knockout.mapping-latest",
                "tinyMCE": "vendor/tinymce/tinymce.min",//tinyMCE
                "jQuery_tinyMCE": "vendor/tinymce/jquery.tinymce.min",//tinyMCE
                'ko_tinyMCE': 'js/wysiwyg',
                "jquery-ui": "js/jquery-ui",
                "ko_autocomplete": "js/knockout-jqAutocomplete",//https://github.com/rniemeyer/knockout-jqAutocomplete
                "dataTables": "js/jquery.dataTables",
                "numBox": "js/jquery.numbox-1.2.0.min",
                //'tableTools': 'js/dataTables.tableTools.min',
                "ko_bootstrap": "js/knockout-bootstrap.min",//http://billpull.com/knockout-bootstrap/index.html
               
            },
            map: {
                // '*' means all modules will get 'jquery-private'
                // for their 'jquery' dependency.
                //'*': {
                //    'jquery': 'jquery-private'
                //},

                // 'jquery-private' wants the real jQuery module
                // though. If this line was not here, there would
                // be an unresolvable cyclic dependency.
                //'jquery-private': {
                //    'jquery': 'jquery'
                //}
            },
            shim: {
                'komapping': {
                    deps: ["knockout"],
                    exports: "komapping"
                },
                'jasnybs': {
                    deps: ['bootstrap']
                },
                'multiselect': {
                    deps: ['bootstrap', "knockout", 'jquery'],
                    exports: 'multiselect'
                },
                'select2': {
                    deps: ['jquery', 'bootstrap'],
                    exports: 'select2'
                },               
                'datetimepicker': {
                    deps: ['bootstrap', 'moment']
                },
                'tinyMCE': {
                    exports: 'tinyMCE',
                    init: function () {
                        this.tinyMCE.DOM.events.domLoaded = true;
                        return this.tinyMCE;
                    }
                },
                'ko_tinyMCE': {
                    deps: ["knockout", 'jquery', 'tinyMCE'],
                },
                'ko_bootstrap':{
                    deps: ['bootstrap', 'knockout'],
                    exports: 'ko_bootstrap'
                },
                "jquery-ui": {
                    exports: "$",
                    deps: ['jquery']
                },
                'ko_autocomplete': {
                    deps: ['jquery-ui', 'knockout'],
                    exports: 'ko_autocomplete'
                },
                'dataTables': {
                    deps: ['jquery'],
                    exports:'dataTables'
                },
                'numBox':{
                    deps: ['jquery'],
                    exports: 'numBox'
                }
                //'tableTools': {
                //    deps: ['dataTables'],
                //    exports:'tableTools'
                //}
            }
        };

    if (ENV !== 'qa' || "asiapacific\\qinle;".indexOf(_hpUserNameClean) !== -1) {
        REQUIREJS_CONFIG.bundles = {
            'js/sd-components': [
                'model/AppConfig',
                'util/apputility',
                'model/Oppty',
                'model/RequestAPI',
                'component/TopLink',
                'component/TopLinkHome',
                'component/OpptyID',
                'component/DateTimePicker',
                'component/PeoplePicker',
                'component/PopQuesArea',
                'component/QuestionArea',
                'component/AllOppty',
                'component/AppHome',
                'component/MyOppty',
                'component/CountrySelector',
                'component/ReviewAndExtract',
                'component/AttachmentManager',
                'component/DollarFormatter',
                'component/Section0201',
                'component/Section0202',
                'component/Section0301',
                'component/Section030201',
                'component/Section030202',
                'component/Section030203',
                'component/Section030204',
                'component/Section040101',
                'component/Section040102',
                'component/Section0402',
                'component/Section040301',
                'component/Section040302',
                'component/Section040303',
                'component/Section040304',
                'component/Section040305',
                'component/Section040306',
                'component/Section040307',
                'component/Section0404',
                'component/Section040501',
                'component/Section040502',
                'component/Section040503',
                'component/Section040504',
                'component/Section040505',
                'component/Section040506',
                'component/Section0406',
                'component/Section0407',
                'component/SDContents',
                'component/SectionLoader'
            ]
        }
    }

    window.sd = {};
    window.sd.rootUrl = URL_Root;
    window.sd.loadWebComponent = loadWebComponent;
    window.sd.webComponentLoader = undefined;
    window.sd.workingOnItDialog = undefined;
    window.sd.env = ENV;


    loadCss(URL_CSS);
    changeSharePointLinkToAppHome();
    
    //
    // load web component according to option parameter. option is an object like this:
    //
    // {
    //   container: "#containerId",
    //   componentModule: "module name of web component",
    //   componentParams: {}
    // }
    //
    function loadWebComponent(option) {
        //showWorkingOnItDialog()(function (dialog) {
        //    window.sd.workingOnItDialog = dialog;
        //});
        
        initRequireJs(["js/webComponentLoader", "jquery", "knockout"], function (webCompLoader, $, ko) {
            webCompLoader.load(option);
            window.sd.webComponentLoader = webCompLoader;
            window.ko = ko;
            window.sp.showBody(true);
            $(function() {
                setTimeout(function() {
                }, 2000);
            });
        });
    }

    //
    // this function load requirejs library, config requirejs with REQUIREJS_CONFIG, 
    // and then load specified modules.
    //
    function initRequireJs(modules, callback) {
        whenReady(["!" + URL_REQUIREJS, "require"], function () {
            //use HPIT default jQuery, v1.9.1
            define('jquery', [], function () {
                return jQuery;
            });
            var req = require.config(REQUIREJS_CONFIG);
            req(modules, callback);
        });
    }

    function changeSharePointLinkToAppHome() {
        whenReady(["jQuery", "$", "DomReady"], function () {
            var $spDiv = $("#suiteBarLeft").find("div.ms-core-brandingText:contains('SharePoint')"),
                $spLink = $spDiv.parent();

            $spLink.attr("href", "Home.aspx").attr("title", "Back to The Solution Source");
            $spDiv.text("The Solution Source");
        });
    }

    function isInEditMode(callback) {
        whenReady("SP.Ribbon.PageState.Handlers.isInEditMode", "function", function() {
            if (typeof callback === "function") {
                callback(SP.Ribbon.PageState.Handlers.isInEditMode());
            }
        });
    }
   
    function whenReady() {
        "ver 2015.8.13"; var e, t, n, l, a, r = 50, s = null, o = null; if (1 === arguments.length) return void function (e, t) { var n = !1, l = !0, a = e.document, r = a.documentElement, s = a.addEventListener, o = s ? "addEventListener" : "attachEvent", c = s ? "removeEventListener" : "detachEvent", u = s ? "" : "on", i = function (l) { ("readystatechange" != l.type || "complete" == a.readyState) && (("load" == l.type ? e : a)[c](u + l.type, i, !1), !n && (n = !0) && t.call(e, l.type || l)) }, d = function () { try { r.doScroll("left") } catch (e) { return void setTimeout(d, 50) } i("poll") }; if ("complete" == a.readyState) t.call(e, "lazy"); else { if (!s && r.doScroll) { try { l = !e.frameElement } catch (f) { } l && d() } a[o](u + "DOMContentLoaded", i, !1), a[o](u + "readystatechange", i, !1), e[o](u + "load", i, !1) } }(window, arguments[0]); if (e = arguments[0], t = 2 === arguments.length ? null : arguments[1], n = 2 === arguments.length ? arguments[1] : arguments[2], e instanceof Array) return void (0 === e.length ? n() : whenReady.call(null, e[0], t, function () { e.shift(), whenReady.call(null, e, t, n) })); if ("domready" === e.toLowerCase() || "domcontentloaded" === e.toLowerCase()) return void whenReady.call(null, n); if ("http://" === e.substr(0, 7).toLowerCase() || "https://" === e.substr(0, 8).toLowerCase() || "//" === e.substr(0, 2) || "!" === e.substr(0, 1)) return "!" === e.substr(0, 1) && (e = e.substr(1)), void function (e) { function t(t, n) { var l, a = e.createElement(t); for (l in n) n.hasOwnProperty(l) && a.setAttribute(l, n[l]); return a } function n(e) { var t, n, l = c[e]; l && (t = l.callback, n = l.urls, n.shift(), u = 0, n.length || (t && t.call(l.context, l.obj), c[e] = null, i[e].length && a(e))) } function l() { if (!s) { var t = navigator.userAgent; s = { async: e.createElement("script").async === !0 }, (s.webkit = /AppleWebKit\//.test(t)) || (s.ie = /MSIE/.test(t)) || (s.opera = /Opera/.test(t)) || (s.gecko = /Gecko\//.test(t)) || (s.unknown = !0) } } function a(a, u, d, f, h) { var y, g, m, p, w = function () { n(a) }, v = "css" === a; if (l(), u) if (u = "string" == typeof u ? [u] : u.concat(), v || s.async || s.gecko || s.opera) i[a].push({ urls: u, callback: d, obj: f, context: h }); else for (y = 0, g = u.length; g > y; ++y) i[a].push({ urls: [u[y]], callback: y === g - 1 ? d : null, obj: f, context: h }); if (!c[a] && (p = c[a] = i[a].shift())) for (o || (o = e.head || e.getElementsByTagName("head")[0]), u = p.urls, y = 0, g = u.length; g > y; ++y) d = u[y], v ? m = s.gecko ? t("style") : t("link", { href: d, rel: "stylesheet" }) : (m = t("script", { src: d }), m.async = !1), m.className = "lazyload", m.setAttribute("charset", "utf-8"), s.ie && !v ? m.onreadystatechange = function () { /loaded|complete/.test(m.readyState) && (m.onreadystatechange = null, w()) } : v && (s.gecko || s.webkit) ? s.webkit ? (p.urls[y] = m.href, r()) : (m.innerHTML = '@import "' + d + '";', n("css")) : m.onload = m.onerror = w, o.appendChild(m) } function r() { var e, t = c.css; if (t) { for (e = d.length; --e >= 0;) if (d[e].href === t.urls[0]) { n("css"); break } u += 1, t && (200 > u ? setTimeout(r, 50) : n("css")) } } var s, o, c = {}, u = 0, i = { css: [], js: [] }, d = e.styleSheets; return { css: function (e, t, n, l) { a("css", e, t, n, l) }, js: function (e, t, n, l) { a("js", e, t, n, l) } } }(window.document).js(e, n); for (l = e.split("."), a = 0; a < l.length - 1; ++a) if (s = null === s ? window[l[a]] : s[l[a]], "undefined" == typeof s) return void setTimeout(function () { whenReady.call(null, e, t, n) }, r); o = null !== s ? s[l[l.length - 1]] : window[e], typeof o === t || null === t && "undefined" != typeof o ? n() : setTimeout(function () { whenReady.call(null, e, t, n) }, r)
    }

    function loadCss(cssUrl) {
        var LazyLoad = function (j) { function p(c, a) { var g = j.createElement(c), b; for (b in a) a.hasOwnProperty(b) && g.setAttribute(b, a[b]); return g } function m(c) { var a = k[c], b, e; if (a) b = a.callback, e = a.urls, e.shift(), h = 0, e.length || (b && b.call(a.context, a.obj), k[c] = null, n[c].length && i(c)) } function u() { if (!b) { var c = navigator.userAgent; b = { async: j.createElement("script").async === !0 }; (b.webkit = /AppleWebKit\//.test(c)) || (b.ie = /MSIE/.test(c)) || (b.opera = /Opera/.test(c)) || (b.gecko = /Gecko\//.test(c)) || (b.unknown = !0) } } function i(c, a, g, e, h) { var i = function () { m(c) }, o = c === "css", f, l, d, q; u(); if (a) if (a = typeof a === "string" ? [a] : a.concat(), o || b.async || b.gecko || b.opera) n[c].push({ urls: a, callback: g, obj: e, context: h }); else { f = 0; for (l = a.length; f < l; ++f) n[c].push({ urls: [a[f]], callback: f === l - 1 ? g : null, obj: e, context: h }) } if (!k[c] && (q = k[c] = n[c].shift())) { r || (r = j.head || j.getElementsByTagName("head")[0]); a = q.urls; f = 0; for (l = a.length; f < l; ++f) g = a[f], o ? d = b.gecko ? p("style") : p("link", { href: g, rel: "stylesheet" }) : (d = p("script", { src: g }), d.async = !1), d.className = "lazyload", d.setAttribute("charset", "utf-8"), b.ie && !o ? d.onreadystatechange = function () { if (/loaded|complete/.test(d.readyState)) d.onreadystatechange = null, i() } : o && (b.gecko || b.webkit) ? b.webkit ? (q.urls[f] = d.href, s()) : (d.innerHTML = '@import "' + g + '";', m("css")) : d.onload = d.onerror = i, r.appendChild(d) } } function s() { var c = k.css, a; if (c) { for (a = t.length; --a >= 0;) if (t[a].href === c.urls[0]) { m("css"); break } h += 1; c && (h < 200 ? setTimeout(s, 50) : m("css")) } } var b, r, k = {}, h = 0, n = { css: [], js: [] }, t = j.styleSheets; return { css: function (c, a, b, e) { i("css", c, a, b, e) }, js: function (c, a, b, e) { i("js", c, a, b, e) } } }(window.document);
        LazyLoad.css(cssUrl);
    }

    function loadJs(jsUrl, callback) {
        var LazyLoad = function (j) { function p(c, a) { var g = j.createElement(c), b; for (b in a) a.hasOwnProperty(b) && g.setAttribute(b, a[b]); return g } function m(c) { var a = k[c], b, e; if (a) b = a.callback, e = a.urls, e.shift(), h = 0, e.length || (b && b.call(a.context, a.obj), k[c] = null, n[c].length && i(c)) } function u() { if (!b) { var c = navigator.userAgent; b = { async: j.createElement("script").async === !0 }; (b.webkit = /AppleWebKit\//.test(c)) || (b.ie = /MSIE/.test(c)) || (b.opera = /Opera/.test(c)) || (b.gecko = /Gecko\//.test(c)) || (b.unknown = !0) } } function i(c, a, g, e, h) { var i = function () { m(c) }, o = c === "css", f, l, d, q; u(); if (a) if (a = typeof a === "string" ? [a] : a.concat(), o || b.async || b.gecko || b.opera) n[c].push({ urls: a, callback: g, obj: e, context: h }); else { f = 0; for (l = a.length; f < l; ++f) n[c].push({ urls: [a[f]], callback: f === l - 1 ? g : null, obj: e, context: h }) } if (!k[c] && (q = k[c] = n[c].shift())) { r || (r = j.head || j.getElementsByTagName("head")[0]); a = q.urls; f = 0; for (l = a.length; f < l; ++f) g = a[f], o ? d = b.gecko ? p("style") : p("link", { href: g, rel: "stylesheet" }) : (d = p("script", { src: g }), d.async = !1), d.className = "lazyload", d.setAttribute("charset", "utf-8"), b.ie && !o ? d.onreadystatechange = function () { if (/loaded|complete/.test(d.readyState)) d.onreadystatechange = null, i() } : o && (b.gecko || b.webkit) ? b.webkit ? (q.urls[f] = d.href, s()) : (d.innerHTML = '@import "' + g + '";', m("css")) : d.onload = d.onerror = i, r.appendChild(d) } } function s() { var c = k.css, a; if (c) { for (a = t.length; --a >= 0;) if (t[a].href === c.urls[0]) { m("css"); break } h += 1; c && (h < 200 ? setTimeout(s, 50) : m("css")) } } var b, r, k = {}, h = 0, n = { css: [], js: [] }, t = j.styleSheets; return { css: function (c, a, b, e) { i("css", c, a, b, e) }, js: function (c, a, b, e) { i("js", c, a, b, e) } } }(window.document);
        LazyLoad.js(jsUrl, callback);
    }

    function showWorkingOnItDialog(callback) {

        var currentShowingDialogToken = null;

        return function (callback) {
            var result = {
                dialog: null,
                token: new Date().getUTCMilliseconds,
                close: closeDialog
            };

            if (currentShowingDialogToken === null) {
                currentShowingDialogToken = result.token;
                ExecuteOrDelayUntilScriptLoaded(function () {
                    result.dialog = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
                    if (typeof callback === "function") {
                        callback(result.dialog);
                    }
                }, "SP.js");
            } else {
                result.dialog = {
                    close: function () { }
                };
                if (typeof callback === "function") {
                    callback(result.dialog);
                }
            }

            function closeDialog() {
                if (result.dialog !== null) {
                    if (result.token === currentShowingDialogToken) {
                        result.dialog.close();
                        currentShowingDialogToken = null;
                    }
                } else {
                    setTimeout(closeDialog, 50);
                }
            }

            return result;
        };
    }

}());

