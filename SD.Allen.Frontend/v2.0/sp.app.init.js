/* * * * * * * * * * * 
 * FRAMEWORK ASSETS  *
 * NO BUSINESS CODE  *
 * DO NOT CUSTOMIZE  *
 * * * * * * * * * * */

/* global define */
(function () {
    "use strict";

    var exports = {
        config: {},
        workingDialog: null,
        ko: null,
        cache: {
            resources: null
        },
        debug: {
            version: 2.1,
            config: {
                original: null,
                final: null
            },
            require: null
        }
    },
    filename = "sp.app.init.js",
    frameworkConfig = null,
    customRequire = null;


    function getProperty(obj, propertyPath) {
        var tokens = propertyPath.split('.');

        return tokens.reduce(function (prev, curr) {
            if (typeof prev === "undefined") {
                return prev;
            }
            return prev[curr];
        }, obj);
    }


    function initConfig() {
        var environments, environment, result;

        function getEnvironment() {
            var environmentName,
                site,
                result;

            if (typeof environments === "undefined") {
                throw new Error("sp.app: Unable to read config from sp.app.environments.");
            }

            for (environmentName in environments) {
                if (environments.hasOwnProperty(environmentName) && environmentName !== "base") {
                    result = environments[environmentName];
                    site = getProperty(result, "framework.sp.site");
                    if (site instanceof RegExp === false) {
                        throw new Error("sp.app: The type of framework.sp.site in sp.app.config.js must be RegExp.");
                    } else if (site.test(window.location.href)) {
                        return result;
                    }
                }
            }
        }


        function fill(target, source) {

            /* eslint no-param-reassign: 0 */
            var propertyName;

            if (typeof target === "undefined") {
                target = {};
            }

            if (source instanceof Date) {
                target = new Date(source.getTime());
            } else if (source instanceof RegExp) {
                target = new RegExp(source);
            } else if (source instanceof Array) {
                target = source.map(function (item) {
                    return fill({}, item);
                });
            } else if (Object.prototype.toString.call(source) === "[object Object]") {
                for (propertyName in source) {
                    if (source.hasOwnProperty(propertyName)) {
                        if (typeof source[propertyName] === "undefined" && target.hasOwnProperty(propertyName)) {
                            delete target[propertyName];
                        } else {
                            target[propertyName] = fill(target[propertyName], source[propertyName]);
                        }
                    }
                }
            } else {
                target = source;
            }

            return target;
        }


        environments = getProperty(window, "sp.app.environments");
        environment = getEnvironment() || {};
        result = getProperty(environments, "base") || {};
        result = fill({}, result);
        result = fill(result, environment);
        return result;
    }


    function initRequireJS() {

        /* global require */

        function getCurrentFolder() {
            var scripts = document.getElementsByTagName("script"),
            index = scripts.length - 1,
            file = filename.replace(/\./g, "\\."),
            match = new RegExp("\\/" + file + "$", "i"),
            replace = new RegExp("(.*)\\/" + file + "$", "i"),
            script;

            for (index; index >= 0; index -= 1) {
                script = scripts[index];
                if (script.src && script.src.match(match)) {
                    return script.src.replace(replace, "$1");
                }
            }
        }


        if (typeof require === "undefined") {
            throw new Error("sp.app: RequireJS not loaded, please load it at first.");
        }

        if (typeof getProperty(frameworkConfig, "requireJS.context") === "undefined") {
            frameworkConfig.requireJS.context = frameworkConfig.name;
        }

        if (typeof getProperty(frameworkConfig, "requireJS.baseUrl") === "undefined") {
            frameworkConfig.requireJS.baseUrl = getCurrentFolder();
        }

        return require.config(frameworkConfig.requireJS);
    }


    function initWorkingDialog() {

        /* global SP */
        /* eslint new-cap:0 */
        var dialog = null;


        function show(message) {
            if (typeof message !== "string") {
                throw new Error("sp.app: Parameter for workingDialog.show should be string.");
            }
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                // not sure if the document.body == null problem still exists
                ExecuteOrDelayUntilScriptLoaded(function () {
                    var parent, node;

                    if (dialog === null || dialog.get_closed() === true) {
                        dialog = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
                    }
                    parent = document.querySelector(".ms-textXLarge");
                    node = document.createElement("p");
                    node.setAttribute("message", escape(message));
                    node.innerText = message;

                    parent.appendChild(node);

                    dialog.autoSize();
                }, "sp.ui.dialog.js");
            });
        }

        function hide(message) {
            if (typeof message !== "string") {
                throw new Error("sp.app: Parameter for workingDialog.hide should be string.");
            }
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                ExecuteOrDelayUntilScriptLoaded(function () {
                    var node;

                    if (dialog !== null && dialog.get_closed() === false) {
                        node = document.querySelector(".ms-textXLarge p[message=\"" + escape(message) + "\"]");
                        if (node !== null) {
                            document.querySelector(".ms-textXLarge").removeChild(node);
                            dialog.autoSize();
                            if (document.querySelectorAll("p[message]").length === 0) {
                                dialog.close();
                            }
                        }
                    }
                }, "sp.ui.dialog.js");
            });
        }

        function close() {
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                ExecuteOrDelayUntilScriptLoaded(function () {
                    if (dialog !== null && dialog.get_closed() === false) {
                        dialog.close();
                    }
                }, "sp.ui.dialog.js");
            });
        }

        return {
            show: show,
            hide: hide,
            close: close
        };
    }

    function initFileUploadinDialog() {

        /* global SP */
        /* eslint new-cap:0 */
        var dialog = null;
        var fileCount = 0;
        function show(message) {
            fileCount += 1;
            updateUploadingState();
            if (typeof message !== "string") {
                throw new Error("sp.app: Parameter for workingDialog.show should be string.");
            }
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                // not sure if the document.body == null problem still exists
                ExecuteOrDelayUntilScriptLoaded(function () {
                    var parent, node;

                    if (dialog === null || dialog.get_closed() === true) {
                        dialog = SP.UI.ModalDialog.showWaitScreenSize(SP.Res.dialogLoading15);
                    }
                    parent = document.querySelector(".ms-textXLarge");
                    node = document.createElement("p");
                    node.setAttribute("message", escape(message));
                    node.innerText = message;

                    parent.appendChild(node);
                    //".ms-floatRight";
                    var cancelBtn = document.querySelector(".ms-dlgFrameContainer").querySelector(".ms-floatRight").firstChild;
                    cancelBtn.setAttribute('value', 'Close');
                    dialog.autoSize();
                }, "sp.ui.dialog.js");
            });
        }

        function hide(message) {
            fileCount -= 1;
            updateUploadingState();
            if (typeof message !== "string") {
                throw new Error("sp.app: Parameter for workingDialog.hide should be string.");
            }
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                ExecuteOrDelayUntilScriptLoaded(function () {
                    var node;

                    if (dialog !== null && dialog.get_closed() === false) {
                        node = document.querySelector(".ms-textXLarge p[message=\"" + escape(message) + "\"]");
                        if (node !== null) {
                            document.querySelector(".ms-textXLarge").removeChild(node);
                            dialog.autoSize();
                            if (document.querySelectorAll("p[message]").length === 0) {
                                dialog.close();
                            }
                        }
                    }
                }, "sp.ui.dialog.js");
            });
        }

        function close() {
            customRequire(["global!ExecuteOrDelayUntilScriptLoaded"], function (ExecuteOrDelayUntilScriptLoaded) {
                ExecuteOrDelayUntilScriptLoaded(function () {
                    if (dialog !== null && dialog.get_closed() === false) {
                        dialog.close();
                    }
                }, "sp.ui.dialog.js");
            });
        }

        function updateUploadingState() {
            var uploaingWarning = document.querySelector(".attachment-uploaing-warning");
            if (fileCount == 1) {
                uploaingWarning.innerText = "uploading " + fileCount + " file...";
            } else if (fileCount > 1) {
                uploaingWarning.innerText = "uploading " + fileCount + " files...";
            } else{
                uploaingWarning.innerText = "";
            }
        }

        return {
            fileCount:fileCount,
            show: show,
            hide: hide,
            close: close
        };
    }

    function initPageHandlers() {
        var path = window.location.href,
            name,
            pageHandler;


        function ensureCss(name, css) {
            var head = document.head || document.getElementsByTagName('head')[0],
                attribute = "sp-app-css-for",
                attributeValue = escape(name),
                style = document.querySelector("style[" + attribute + "=\"" + attributeValue + "\"]");

            if (style !== null) {
                return;
            }

            style = document.createElement('style');
            style.setAttribute("sp-app-css-for", attributeValue);
            style.type = 'text/css';

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }


        function initPageHandler(name, pageHandler) {
            var hasWorkingMessage = typeof pageHandler.workingMessage === "string";

            if (pageHandler.areas instanceof Array === true) {
                ensureCss(name, pageHandler.areas.join(", ") + " { display:none; }");
            }

            if (hasWorkingMessage === true) {
                exports.workingDialog.show(pageHandler.workingMessage);
            }

            customRequire([pageHandler.module], function () {
                if (hasWorkingMessage === true) {
                    exports.workingDialog.hide(pageHandler.workingMessage);
                }
            });
        }

        for (name in frameworkConfig.pageHandlers) {
            if (frameworkConfig.pageHandlers.hasOwnProperty(name)) {
                pageHandler = frameworkConfig.pageHandlers[name];
                if (pageHandler.url instanceof RegExp === false) {
                    throw new Error("sp.app: The type of pageHandler.url in sp.app.config.js must be RegExp.");
                } else if (pageHandler.url.test(path)) {
                    initPageHandler(name, pageHandler);
                }
            }
        }
    }

    function initKO() {

        function getAllDescendantComponents(component) {
            var result = [component],
                i;

            if (component.subComponents instanceof Array) {
                for (i = 0; i < component.subComponents.length; i += 1) {
                    result.push.apply(result, getAllDescendantComponents(component.subComponents[i]));
                }
            }

            return result;
        }


        function isDeferredPromise(obj) {
            return typeof obj === "object" && typeof obj.then === "function";
        }


        //
        // template can be defined as "template: { require: 'some/template' }",
        // this function handle this case.
        //
        function prepareAMDDefinedTemplates(allComponents, callback) {
            var i, component, templateCreatorResult,
                readyComponentCount = 0;


            function onTemplateReady() {
                readyComponentCount += 1;
                if (readyComponentCount >= allComponents.length &&
                    typeof callback === "function") {
                    callback();
                }
            }

            for (i = 0; i < allComponents.length; i += 1) {

                component = allComponents[i];

                if (typeof component.template === "object" &&
                    typeof component.template.require === "string") {
                    //
                    // template: { require: 'templateModuleId' }
                    //
                    (function (component) {
                        require([component.template.require], function (templateHtml) {
                            component.template = templateHtml;
                            onTemplateReady();
                        });
                    }(component));

                } else if (typeof component.template === "object" &&
                           typeof component.template.createTemplate === "function") {
                    //
                    // template: { createTemplate: getTemplate }
                    //
                    (function (component) {

                        //
                        // getTemplate(callback) style
                        //
                        templateCreatorResult = component.template.createTemplate(function (templateHtml) {
                            component.template = templateHtml;
                            onTemplateReady();
                        });

                        if (isDeferredPromise(templateCreatorResult)) {
                            //
                            // getTemplate() returns a deferred object
                            //
                            templateCreatorResult.then(function (templateHtml) {
                                component.template = templateHtml;
                                onTemplateReady();
                            });
                        } else if (typeof templateCreatorResult !== "undefined") {
                            //
                            // getTemplate() returns something else
                            //
                            component.template = templateCreatorResult;
                            onTemplateReady();
                        }

                    }(component));

                } else if (typeof component.template === "object" &&
                           isDeferredPromise(component.template)) {
                    //
                    // template: deferredObject
                    //
                    (function (component) {
                        component.template.then(function (templateHtml) {
                            component.template = templateHtml;
                            onTemplateReady();
                        });
                    }(component));

                } else {
                    onTemplateReady();
                }
            }
        }


        function prepareComponents(allComponents, callback) {
            prepareAMDDefinedTemplates(allComponents, callback);
        }


        function prepareComponentBeforeRegister(component, callback) {
            var allComponents = getAllDescendantComponents(component);

            prepareComponents(allComponents, callback);
        }


        function registerKnockoutComponent(ko, component) {
            var i;

            if (component.name instanceof Array) {
                for (i = 0; i < component.name.length; i += 1) {
                    if (!ko.components.isRegistered(component.name[i])) {
                        ko.components.register(component.name[i], component);
                    }
                }
            } else {
                if (!ko.components.isRegistered(component.name)) {
                    ko.components.register(component.name, component);
                }
            }

            if (component.subComponents instanceof Array) {
                for (i = 0; i < component.subComponents.length; i += 1) {
                    registerKnockoutComponent(ko, component.subComponents[i]);
                }
            }
        }


        function getContainerElement(container) {
            if (typeof container === "string") {
                if (container.substr(0, 1) === "#") {
                    return document.getElementById(container.substr(1));
                } else {
                    throw new Error("sp.app: Component container must be a element or a string start with '#'.");
                }
            } else {
                return container;
            }
        }


        function buildComponentElementDataBindValue(component, componentParams) {
            var dataBindValue;

            dataBindValue = "component: { name: \"";
            dataBindValue += component.name instanceof Array ? component.name[0] : component.name;
            dataBindValue += "\"";
            dataBindValue += componentParams && JSON ? ", params: " + JSON.stringify(componentParams) : "";
            dataBindValue += " }";

            return dataBindValue;
        }


        function renderRootComponent(ko, rootComponent, containerId, componentParams) {
            var container = getContainerElement(containerId),
                dataBindValue = buildComponentElementDataBindValue(rootComponent, componentParams);

            container.setAttribute("data-bind", dataBindValue);
            ko.applyBindings(container);
        }


        function loadCore(option, ko, rootComponent, callback) {
            prepareComponentBeforeRegister(rootComponent, function () {
                registerKnockoutComponent(ko, rootComponent);
                renderRootComponent(ko, rootComponent, option.container, option.params);
                if (typeof callback === "function") {
                    callback(rootComponent);
                }
            });
        }

        function loadComponent(option, callback) {
            var hasWorkingMessage = typeof option.workingMessage === "string",
                koPath = getProperty(frameworkConfig, "ko.path");

            if (!option ||
                !option.container ||
                !option.module) {
                throw new Error("sp.app: Parameter invalid for ko.loadComponent().");
            }

            if (typeof koPath === "undefined") {
                throw new Error("sp.app: Missing framework configiuration: framework.ko.path");
            }

            if (hasWorkingMessage === true) {
                exports.workingDialog.show(option.workingMessage);
            }

            customRequire([koPath, option.module], function (ko, rootComponent) {
                if (!rootComponent) {
                    throw new Error("sp.app: Unable to load ko component '" + option.module + "'.");
                }

                loadCore(option, ko, rootComponent, callback);

                if (hasWorkingMessage === true) {
                    exports.workingDialog.hide(option.workingMessage);
                }
            });
        }

        return { loadComponent: loadComponent };
    }


    function initApplicationCache() {

        /* global applicationCache */
        var messages = {
            starting: "Downloading new resources...",
            progress: "",
            failed: "Failed downloading resources, please contact developer.",
            wait: ""
        },
            isSupported = true;


        function onDownloading() {
            exports.workingDialog.show(messages.starting);
        }


        function onProgress(e) {
            exports.workingDialog.hide(messages.progress);
            messages.progress = "Resources downloaded: " + e.loaded + "/" + e.total;
            exports.workingDialog.show(messages.progress);
        }


        function onError() {
            exports.workingDialog.show(messages.failed);
        }


        function onUpdateReady() {
            var waitSeconds = 4,
                timeout = 1000;

            function wait() {
                exports.workingDialog.hide(messages.wait);
                waitSeconds -= 1;

                if (waitSeconds === 0) {
                    applicationCache.swapCache();
                    location.reload();
                } else {
                    if (waitSeconds > 1) {
                        messages.wait = "Wait for " + waitSeconds + " seconds to refresh page...";
                    } else {
                        messages.wait = "Wait for " + waitSeconds + " second to refresh page...";
                    }
                    exports.workingDialog.show(messages.wait);
                    setTimeout(wait, timeout);
                }
            }

            wait();
        }


        function onCached() {
            exports.workingDialog.hide(messages.starting);
            exports.workingDialog.hide(messages.progress);
        }

        function update() {
            if (isSupported === true) {
                applicationCache.update();
            }
        }

        function init() {

            /* application cache event order:
             *                            /--> onnoupdate                /--> oncached
             * onloaded(page) -> onchecking -> ondownloading -> onprogress -> onupdateready
             *                            \--> onobsolete                \--> onerror  
             */

            if (document.documentElement.hasAttribute("manifest") === false) {
                isSupported = false;
            }
            if (typeof applicationCache === "undefined" || applicationCache === null) {
                isSupported = false;
            }

            if (isSupported === false) {
                return;
            }

            applicationCache.addEventListener("downloading", onDownloading);
            applicationCache.addEventListener("progress", onProgress);
            applicationCache.addEventListener("error", onError);
            applicationCache.addEventListener("updateready", onUpdateReady);
            applicationCache.addEventListener("cached", onCached);
        }


        init();

        return { update: update };
    }


    function initPluginsForRequireJS() {

        /* global requirejs */
        var context = requirejs.s.contexts[frameworkConfig.requireJS.context];

        /* 
         * how to use:
         * require(["global!var_name"], function(var_name) { console.log(var_name); });
         */
        define("global", [], function () {

            function ensure(parent, name, callback) {
                var names = name.split("."),
                    actualName = names[0],
                    timeout = 100;

                if (typeof parent[actualName] === "undefined") {
                    setTimeout(function () {
                        ensure(parent, name, callback);
                    }, timeout);
                } else if (names.length === 1) {
                    callback(parent[actualName]);
                } else {
                    names.shift();
                    ensure(parent[actualName], names.join("."), callback);
                }
            }

            function load(name, req, onload) {
                ensure(window, name, onload);
            }

            return { load: load };
        });
        context.completeLoad("global");

        /* 
        * how to use:
        * require(["domReady"], function(domReady) { domReady(function(){ document is ready }) });
        * require(["domReady!"], function(document) { document is ready });
        * code from https://github.com/requirejs/domReady
        */
        /* eslint-disable */
        define("domReady", [], function () { "use strict"; function n(n) { var e; for (e = 0; e < n.length; e += 1) n[e](r) } function e() { var e = u; l && e.length && (u = [], n(e)) } function t() { l || (l = !0, c && clearInterval(c), e()) } function o(n) { return l ? n(r) : u.push(n), o } var d, i, c, a = "undefined" != typeof window && window.document, l = !a, r = a ? document : null, u = []; if (a) { if (document.addEventListener) document.addEventListener("DOMContentLoaded", t, !1), window.addEventListener("load", t, !1); else if (window.attachEvent) { window.attachEvent("onload", t), i = document.createElement("div"); try { d = null === window.frameElement } catch (f) { } i.doScroll && d && window.external && (c = setInterval(function () { try { i.doScroll(), t() } catch (n) { } }, 30)) } "complete" === document.readyState && t() } return o.version = "2.0.1", o.load = function (n, e, t, d) { d.isBuild ? t(null) : o(t) }, o });
        /* eslint-enable */
        context.completeLoad("domReady");


        /* 
         * how to use:
         * require(["css!css_file_without_extension"], function() {});
         * code from https://github.com/guybedford/require-css
         */
        /* eslint-disable */
        define("css", [], function () { if ("undefined" == typeof window) return { load: function (e, t, n) { n() } }; var e = document.getElementsByTagName("head")[0], t = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0, n = !1, r = !0; t[1] || t[7] ? n = parseInt(t[1]) < 6 || parseInt(t[7]) <= 9 : t[2] || t[8] ? r = !1 : t[4] && (n = parseInt(t[4]) < 18); var o = {}; o.pluginBuilder = "./css-builder"; var a, i, s, l = function () { a = document.createElement("style"), e.appendChild(a), i = a.styleSheet || a.sheet }, u = 0, d = [], c = function (e) { u++, 32 == u && (l(), u = 0), i.addImport(e), a.onload = function () { f() } }, f = function () { s(); var e = d.shift(); return e ? (s = e[1], void c(e[0])) : void (s = null) }, h = function (e, t) { if (i && i.addImport || l(), i && i.addImport) s ? d.push([e, t]) : (c(e), s = t); else { a.textContent = '@import "' + e + '";'; var n = setInterval(function () { try { a.sheet.cssRules, clearInterval(n), t() } catch (e) { } }, 10) } }, p = function (t, n) { var o = document.createElement("link"); if (o.type = "text/css", o.rel = "stylesheet", r) o.onload = function () { o.onload = function () { }, setTimeout(n, 7) }; else var a = setInterval(function () { for (var e = 0; e < document.styleSheets.length; e++) { var t = document.styleSheets[e]; if (t.href == o.href) return clearInterval(a), n() } }, 10); o.href = t, e.appendChild(o) }; return o.normalize = function (e, t) { return ".css" == e.substr(e.length - 4, 4) && (e = e.substr(0, e.length - 4)), t(e) }, o.load = function (e, t, r) { (n ? h : p)(t.toUrl(e + ".css"), r) }, o });
        /* eslint-enable */
        context.completeLoad("css");

        /* 
         * how to use:
         * require(["text!text_file"], function(text_file) {});
         * code from https://github.com/requirejs/text
         */
        /* eslint-disable */
        define("text", ["module"], function (d) { var n, i, h, c, o, f = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"], m = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, k = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im, b = typeof location !== "undefined" && location.href, e = b && location.protocol && location.protocol.replace(/\:/, ""), g = b && location.hostname, a = b && (location.port || undefined), l = {}, j = (d.config && d.config()) || {}; n = { version: "2.0.12", strip: function (p) { if (p) { p = p.replace(m, ""); var q = p.match(k); if (q) { p = q[1] } } else { p = "" } return p }, jsEscape: function (p) { return p.replace(/(['\\])/g, "\\$1").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r").replace(/[\u2028]/g, "\\u2028").replace(/[\u2029]/g, "\\u2029") }, createXhr: j.createXhr || function () { var s, p, q; if (typeof XMLHttpRequest !== "undefined") { return new XMLHttpRequest() } else { if (typeof ActiveXObject !== "undefined") { for (p = 0; p < 3; p += 1) { q = f[p]; try { s = new ActiveXObject(q) } catch (r) { } if (s) { f = [q]; break } } } } return s }, parseName: function (r) { var v, u, p, t = false, q = r.indexOf("."), s = r.indexOf("./") === 0 || r.indexOf("../") === 0; if (q !== -1 && (!s || q > 1)) { v = r.substring(0, q); u = r.substring(q + 1, r.length) } else { v = r } p = u || v; q = p.indexOf("!"); if (q !== -1) { t = p.substring(q + 1) === "strip"; p = p.substring(0, q); if (u) { u = p } else { v = p } } return { moduleName: v, ext: u, strip: t } }, xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/, useXhr: function (s, w, q, p) { var u, v, t, r = n.xdRegExp.exec(s); if (!r) { return true } u = r[2]; v = r[3]; v = v.split(":"); t = v[1]; v = v[0]; return (!u || u === w) && (!v || v.toLowerCase() === q.toLowerCase()) && ((!t && !v) || t === p) }, finishLoad: function (p, r, s, q) { s = r ? n.strip(s) : s; if (j.isBuild) { l[p] = s } q(s) }, load: function (t, v, u, s) { if (s && s.isBuild && !s.inlineText) { u(); return } j.isBuild = s && s.isBuild; var q = n.parseName(t), w = q.moduleName + (q.ext ? "." + q.ext : ""), r = v.toUrl(w), p = (j.useXhr) || n.useXhr; if (r.indexOf("empty:") === 0) { u(); return } if (!b || p(r, e, g, a)) { n.get(r, function (x) { n.finishLoad(t, q.strip, x, u) }, function (x) { if (u.error) { u.error(x) } }) } else { v([w], function (x) { n.finishLoad(q.moduleName + "." + q.ext, q.strip, x, u) }) } }, write: function (t, q, r, p) { if (l.hasOwnProperty(q)) { var s = n.jsEscape(l[q]); r.asModule(t + "!" + q, "define(function () { return '" + s + "';});\n") } }, writeFile: function (u, q, w, x, r) { var v = n.parseName(q), p = v.ext ? "." + v.ext : "", s = v.moduleName + p, t = w.toUrl(v.moduleName + p) + ".js"; n.load(s, w, function (y) { var z = function (A) { return x(t, A) }; z.asModule = function (A, B) { return x.asModule(A, t, B) }; n.write(u, s, z, r) }, r) } }; if (j.env === "node" || (!j.env && typeof process !== "undefined" && process.versions && !!process.versions.node && !process.versions["node-webkit"])) { i = require.nodeRequire("fs"); n.get = function (q, t, p) { try { var r = i.readFileSync(q, "utf8"); if (r.indexOf("\uFEFF") === 0) { r = r.substring(1) } t(r) } catch (s) { if (p) { p(s) } } } } else { if (j.env === "xhr" || (!j.env && n.createXhr())) { n.get = function (q, u, p, s) { var r = n.createXhr(), t; r.open("GET", q, true); if (s) { for (t in s) { if (s.hasOwnProperty(t)) { r.setRequestHeader(t.toLowerCase(), s[t]) } } } if (j.onXhr) { j.onXhr(r, q) } r.onreadystatechange = function (w) { var v, x; if (r.readyState === 4) { v = r.status || 0; if (v > 399 && v < 600) { x = new Error(q + " HTTP status: " + v); x.xhr = r; if (p) { p(x) } } else { u(r.responseText) } if (j.onXhrComplete) { j.onXhrComplete(r, q) } } }; r.send(null) } } else { if (j.env === "rhino" || (!j.env && typeof Packages !== "undefined" && typeof java !== "undefined")) { n.get = function (p, w) { var r, x, q = "utf-8", s = new java.io.File(p), t = java.lang.System.getProperty("line.separator"), v = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(s), q)), u = ""; try { r = new java.lang.StringBuffer(); x = v.readLine(); if (x && x.length() && x.charAt(0) === 65279) { x = x.substring(1) } if (x !== null) { r.append(x) } while ((x = v.readLine()) !== null) { r.append(t); r.append(x) } u = String(r.toString()) } finally { v.close() } w(u) } } else { if (j.env === "xpconnect" || (!j.env && typeof Components !== "undefined" && Components.classes && Components.interfaces)) { h = Components.classes; c = Components.interfaces; Components.utils["import"]("resource://gre/modules/FileUtils.jsm"); o = ("@mozilla.org/windows-registry-key;1" in h); n.get = function (r, v) { var q, s, t, p = {}; if (o) { r = r.replace(/\//g, "\\") } t = new FileUtils.File(r); try { q = h["@mozilla.org/network/file-input-stream;1"].createInstance(c.nsIFileInputStream); q.init(t, 1, 0, false); s = h["@mozilla.org/intl/converter-input-stream;1"].createInstance(c.nsIConverterInputStream); s.init(q, "utf-8", q.available(), c.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER); s.readString(q.available(), p); s.close(); q.close(); v(p.value) } catch (u) { throw new Error((t && t.path || "") + ": " + u) } } } } } } return n });
        /* eslint-enable */
        context.completeLoad("text");

    }


    function init() {
        var config = initConfig();

        exports.config = config.others;
        frameworkConfig = config.framework;
        exports.debug.config.final = config;

        /* global sp */
        exports.debug.config.original = sp.app.environments;
        delete sp.app.environments;

        customRequire = initRequireJS();
        exports.debug.require = customRequire;

        initPluginsForRequireJS();

        exports.workingDialog = initWorkingDialog();

        exports.fileUploadinDialog = initFileUploadinDialog();

        exports.cache.resources = initApplicationCache();

        initPageHandlers();

        exports.ko = initKO();

        window.sp = {
            app: exports
        };
    }

    init();
}());