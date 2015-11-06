define(function (require) {
	"use strict";

	var $ = require("jquery"),
		KBUtils = require("./KBUtils");

	function showModalDialog(dialogOptions) {
		ExecuteOrDelayUntilScriptLoaded(function () {
			SP.UI.ModalDialog.showModalDialog(dialogOptions);
		}, "SP.js");
	}

	function getUrlParameter(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null)
			return null;
		else
			return results[1];
	}

	//
	// This function will ensure only one dialog shown at same time.
	//
	var showWorkingOnItDialog = (function () {

		var currentShowingDialogToken = null;

		return function (callback) {
			var result = {
					dialog: null,
					token: newGuid(),
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
	}());

	function closeLastDialog(dialogResult, returnValue) {
		ExecuteOrDelayUntilScriptLoaded(function () {
			SP.UI.ModalDialog.commonModalDialogClose(dialogResult, returnValue);
		}, "SP.js");
	}

	function parseCurrency(str, defaultValue) {
		var num = str,
			defaultNum = defaultValue || 0;

		if (typeof num === "number") {
			return num;
		} else if (typeof num === "string") {
			num = num.replace(/\$/g, "");
			num = num.replace(/,/g, "");
			num = parseFloat(num);
			if (isNaN(num)) {
				num = defaultNum;
			}
			return num;
		}

		return defaultNum;
	}

	function newGuid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			  .toString(16)
			  .substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		  s4() + '-' + s4() + s4() + s4();
	}

	function isDate(dateStr) {
		var d = parseDate(dateStr);
		return d !== null && !isNaN(d);
	}

	function parseDate(dateStr) {
		var d = new Date(dateStr);

		if (typeof dateStr === "undefined" ||
			dateStr === null ||
			dateStr === "") {
			return null;
		}

		if (!isNaN(d.getTime())) {
			return d;
		}

		dateStr = dateStr.replace(/-/g, "/");
		dateStr = dateStr.replace(/年/g, "/").replace(/月/g, "/").replace(/日/g, "/");
		d = new Date(dateStr);

		if (!isNaN(d.getTime())) {
			return d;
		}

		return null;
	}

	function toDateString(d) {
		if (typeof d === "object" && d !== null) {
			return d.getFullYear().toString() + '-' + (d.getMonth() + 1).toString() + '-' + d.getDate().toString();
		} else {
			return toDateString(new Date());
		}
	}

	function createResolvedPromise(returnValue) {
		return $.Deferred(function (dfd) {
			dfd.resolve(returnValue);
		}).promise();
	}

	function enablePeoplePickerAsync(elementId, schema) {
		return $.Deferred(function (dfd) {
			whenPeoplePickerReady(function () {
				SPClientPeoplePicker_InitStandaloneControlWrapper(elementId, null, schema);
				dfd.resolve();
			});
		}).promise();
	}

	function whenPeoplePickerReady(callback) {
		var lazyLoad = getLazyLoad();

		SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
			lazyLoad.js("/_layouts/15/clienttemplates.js", function () {
				lazyLoad.js("/_layouts/15/clientforms.js", function () {
					lazyLoad.js("/_layouts/15/clientpeoplepicker.js", function () {
						lazyLoad.js("/_layouts/15/autofill.js", function () {
							callback();
						});
					});
				});
			});
		});
	}

	function getLazyLoad() {
		var LazyLoad = function (j) { function p(c, a) { var g = j.createElement(c), b; for (b in a) a.hasOwnProperty(b) && g.setAttribute(b, a[b]); return g } function m(c) { var a = k[c], b, e; if (a) b = a.callback, e = a.urls, e.shift(), h = 0, e.length || (b && b.call(a.context, a.obj), k[c] = null, n[c].length && i(c)) } function u() { if (!b) { var c = navigator.userAgent; b = { async: j.createElement("script").async === !0 }; (b.webkit = /AppleWebKit\//.test(c)) || (b.ie = /MSIE/.test(c)) || (b.opera = /Opera/.test(c)) || (b.gecko = /Gecko\//.test(c)) || (b.unknown = !0) } } function i(c, a, g, e, h) { var i = function () { m(c) }, o = c === "css", f, l, d, q; u(); if (a) if (a = typeof a === "string" ? [a] : a.concat(), o || b.async || b.gecko || b.opera) n[c].push({ urls: a, callback: g, obj: e, context: h }); else { f = 0; for (l = a.length; f < l; ++f) n[c].push({ urls: [a[f]], callback: f === l - 1 ? g : null, obj: e, context: h }) } if (!k[c] && (q = k[c] = n[c].shift())) { r || (r = j.head || j.getElementsByTagName("head")[0]); a = q.urls; f = 0; for (l = a.length; f < l; ++f) g = a[f], o ? d = b.gecko ? p("style") : p("link", { href: g, rel: "stylesheet" }) : (d = p("script", { src: g }), d.async = !1), d.className = "lazyload", d.setAttribute("charset", "utf-8"), b.ie && !o ? d.onreadystatechange = function () { if (/loaded|complete/.test(d.readyState)) d.onreadystatechange = null, i() } : o && (b.gecko || b.webkit) ? b.webkit ? (q.urls[f] = d.href, s()) : (d.innerHTML = '@import "' + g + '";', m("css")) : d.onload = d.onerror = i, r.appendChild(d) } } function s() { var c = k.css, a; if (c) { for (a = t.length; --a >= 0;) if (t[a].href === c.urls[0]) { m("css"); break } h += 1; c && (h < 200 ? setTimeout(s, 50) : m("css")) } } var b, r, k = {}, h = 0, n = { css: [], js: [] }, t = j.styleSheets; return { css: function (c, a, b, e) { i("css", c, a, b, e) }, js: function (c, a, b, e) { i("js", c, a, b, e) } } }(window.document);
		return LazyLoad;
	}

	function trimString(val) {
		return val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function isCurrentUserWebAdmin() {
		return $.Deferred(function(dfd) {
			whenReady("_spWebPermMasks", function() {
				dfd.resolve((_spWebPermMasks.Low & 31) === 31);
			});
		}).promise();
	}

	function whenReady(){
		"ver 2015.4.16";var g=50,b,d,a,f,e=null,h=null,c;if(arguments.length===1){(function(l,p){var k=false,o=true,r=l.document,q=r.documentElement,i=r.addEventListener,u=i?"addEventListener":"attachEvent",s=i?"removeEventListener":"detachEvent",j=i?"":"on",t=function(v){if(v.type=="readystatechange"&&r.readyState!="complete"){return}(v.type=="load"?l:r)[s](j+v.type,t,false);if(!k&&(k=true)){p.call(l,v.type||v)}},n=function(){try{q.doScroll("left")}catch(v){setTimeout(n,50);return}t("poll")};if(r.readyState=="complete"){p.call(l,"lazy")}else{if(!i&&q.doScroll){try{o=!l.frameElement}catch(m){}if(o){n()}}r[u](j+"DOMContentLoaded",t,false);r[u](j+"readystatechange",t,false);l[u](j+"load",t,false)}}(window,arguments[0]));return}b=arguments[0];d=arguments.length===2?null:arguments[1];a=arguments.length===2?arguments[1]:arguments[2];if(b instanceof Array){if(b.length===0){a()}else{whenReady.call(null,b[0],d,function(){b.shift();whenReady.call(null,b,d,a)})}return}if(b.toLowerCase()==="domready"||b.toLowerCase()==="domcontentloaded"){whenReady.call(null,a);return}if(b.substr(0,7).toLowerCase()==="http://"||b.substr(0,8).toLowerCase()==="https://"||b.substr(0,2)==="//"){(function(x){function o(m,j){var k=x.createElement(m),i;for(i in j){j.hasOwnProperty(i)&&k.setAttribute(i,j[i])}return k}function v(m){var j=w[m],i,k;if(j){i=j.callback,k=j.urls,k.shift(),z=0,k.length||(i&&i.call(j.context,j.obj),w[m]=null,q[m].length&&y(m))}}function B(){if(!A){var i=navigator.userAgent;A={async:x.createElement("script").async===!0};(A.webkit=/AppleWebKit\//.test(i))||(A.ie=/MSIE/.test(i))||(A.opera=/Opera/.test(i))||(A.gecko=/Gecko\//.test(i))||(A.unknown=!0)}}function y(E,F,r,t,p){var n=function(){v(E)},k=E==="css",s,m,u,j;B();if(F){if(F=typeof F==="string"?[F]:F.concat(),k||A.async||A.gecko||A.opera){q[E].push({urls:F,callback:r,obj:t,context:p})}else{s=0;for(m=F.length;s<m;++s){q[E].push({urls:[F[s]],callback:s===m-1?r:null,obj:t,context:p})}}}if(!w[E]&&(j=w[E]=q[E].shift())){l||(l=x.head||x.getElementsByTagName("head")[0]);F=j.urls;s=0;for(m=F.length;s<m;++s){r=F[s],k?u=A.gecko?o("style"):o("link",{href:r,rel:"stylesheet"}):(u=o("script",{src:r}),u.async=!1),u.className="lazyload",u.setAttribute("charset","utf-8"),A.ie&&!k?u.onreadystatechange=function(){if(/loaded|complete/.test(u.readyState)){u.onreadystatechange=null,n()}}:k&&(A.gecko||A.webkit)?A.webkit?(j.urls[s]=u.href,D()):(u.innerHTML='@import "'+r+'";',v("css")):u.onload=u.onerror=n,l.appendChild(u)}}}function D(){var j=w.css,i;if(j){for(i=C.length;--i>=0;){if(C[i].href===j.urls[0]){v("css");break}}z+=1;j&&(z<200?setTimeout(D,50):v("css"))}}var A,l,w={},z=0,q={css:[],js:[]},C=x.styleSheets;return{css:function(m,j,i,k){y("css",m,j,i,k)},js:function(m,j,i,k){y("js",m,j,i,k)}}}(window.document)).js(b,a);return}f=b.split(".");for(c=0;c<f.length-1;++c){e=e===null?window[f[c]]:e[f[c]];if(typeof e==="undefined"){setTimeout(function(){whenReady.call(null,b,d,a)},g);return}}h=e!==null?e[f[f.length-1]]:window[b];if(typeof h===d||(d===null&&typeof h!=="undefined")){a()}else{setTimeout(function(){whenReady.call(null,b,d,a)},g)}
	};


	return {
		showWorkingOnItDialog: showWorkingOnItDialog,
		closeLastDialog: closeLastDialog,
		parseCurrency: parseCurrency,
		newGuid: newGuid,
		isDate: isDate,
		parseDate: parseDate,
		toDateString: toDateString,
		enablePeoplePickerAsync: enablePeoplePickerAsync,
		getUrlParameter: getUrlParameter,
		showModalDialog: showModalDialog,
		createResolvedPromise: createResolvedPromise,
		trimString: trimString,
		isCurrentUserWebAdmin: isCurrentUserWebAdmin
	};

});