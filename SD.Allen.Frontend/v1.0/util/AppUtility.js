define('util/AppUtility', function (require) {
    "use strict";
    var $ = require("jquery");

    function showModalDialog(dialogOptions) {
        ExecuteOrDelayUntilScriptLoaded(function () {
            SP.UI.ModalDialog.showModalDialog(dialogOptions);
        }, "SP.js");
    }

    //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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

    function trimString(val) {
        return val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function isCurrentUserWebAdmin() {
        return $.Deferred(function (dfd) {
            whenReady("_spWebPermMasks", function () {
                dfd.resolve((_spWebPermMasks.Low & 31) === 31);
            });
        }).promise();
    }

    function htmlEscape(str) {
        //replace all ',' with html code '&#44;'
        str = String(str).replace(/\,/g, '&#44;').replace(/\"/g, '\\"');
        //delete all ',' after the first replace
        return str.split('\n').toString().replace(/\,/g, '');
    }

    function extractFileName(path) {
        //http://stackoverflow.com/questions/20537696/remember-and-repopulate-file-input
        if (path.substr(0, 12) == "C:\\fakepath\\")
            return path.substr(12); // modern browser
        var x;
        x = path.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return path.substr(x + 1);
        x = path.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return path.substr(x + 1);
        return path; // just the filename
    }

    function extractFileExtenionName(path) {
        var x;
        x = path.lastIndexOf('.');
        if (x >= 0) {
            return path.substr(x + 1);
        } else {
            return '';
        }
    }

    function initPopover(prefix) {
        var element;
        element = $('[id*="' + prefix + '"] a[rel=popover]')
        element.popover({
            html: true,
            trigger: 'hover',
            placement: 'bottom',
            content: function () {
                var contentHtml = '',
                    filePath = $(this).data('file'),
                    extension = extractFileExtenionName(filePath).toLowerCase();
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        contentHtml = '<img src="' + filePath + '" />'
                        break;
                    case 'doc':
                    case 'docx':
                    case 'xls':
                    case 'xlsx':
                    case 'ppt':
                    case 'pptx':
                        contentHtml =
                            '<div class="js-frame-wrapper" style="line-height:0">' +
                            '    <iframe src="/teams/ESSolutionDesign-Staging/_layouts/15/WopiFrame.aspx?sourcedoc=' + filePath + '&amp;action=interactivepreview&amp;wdSmallView=1" frameborder="0" style="width:350px; height:221px;"></iframe>' +
                            '</div>';
                        break;
                    default:
                        alert('unsupported file type, please choose another file!');
                        break;
                }

                return contentHtml;
            }
        });
    }

    function getCurrentUser() {
        var dfd = $.Deferred();
        var loginName = _spPageContextInfo.userLoginName;
        var userid = _spPageContextInfo.userId;
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
        var requestHeaders = { "accept": "application/json;odata=verbose" };
        if (loginName !== undefined) {
            dfd.resolve(loginName);
        } else {
            $.ajax({
                url: requestUri,
                contentType: "application/json;odata=verbose",
                headers: requestHeaders,
                async: false,
                success: function (data, request) {
                    loginName = data.d.LoginName.split('|')[1];
                    _spPageContextInfo.user = data.d;
                    _spPageContextInfo.userLoginName = loginName;
                    _spPageContextInfo.userLoginNameClean = loginName.replace("i:0#.w|", "");
                    dfd.resolve(loginName);
                },
                error: function (error) {
                    dfd.fail(error);
                }
            });
        }
        return dfd.promise();
    }

    function transformDateToISO8601(dateStr) {
        return new Date(dateStr).format("yyyy-MM-ddTHH:mm:ss");
    }

    function transformIOSDateToen(dateStr) {
        return new Date(dateStr).format("MMM d yyyy");
    }

    function addSDLinkAfterAppHome() {
        var $spDiv = $("#suiteBarLeft").find("div.ms-core-brandingText:contains('The Solution Source')"),
            $spLink = $spDiv.parent(),
            sdHomeLink = '<span class="sd-head-separate"> / </span>' +
        '<a title="Solution Design" class="ms-core-suiteLink-a" href="SDMyOppty.aspx">' +
        '    <div class="ms-core-brandingText sd-head-text">Solution Design</div>' +
        '</a>';

        $spLink.after(sdHomeLink);
        $("#suiteBar").height(30);
    }

    function compareJson(obj1, obj2) {
        if ((obj1 && typeof obj1 === "object") && ((obj2 && typeof obj2 === "object"))) {
            var count1 = propertyLength(obj1);
            var count2 = propertyLength(obj2);
            if (count1 == count2) {
                for (var ob in obj1) {
                    if (obj1.hasOwnProperty(ob) && obj2.hasOwnProperty(ob)) {

                        if (obj1[ob] == null && obj2[ob] == null) { //extra compare
                            continue;
                        }

                        if (obj1[ob].constructor == Array && obj2[ob].constructor == Array)//if property is an array
                        {
                            if (!compareArray(obj1[ob], obj2[ob])) {
                                return false;
                            };
                        }
                        else if (typeof obj1[ob] === "string" && typeof obj2[ob] === "string")//just property
                        {
                            if (obj1[ob] !== obj2[ob]) {
                                return false;
                            }
                        }
                        else if (typeof obj1[ob] === "object" && typeof obj2[ob] === "object")//property is an object
                        {
                            if (!compareJson(obj1[ob], obj2[ob])) {//if the project
                                return false;
                            };
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }
        return true;
    }

    function propertyLength(obj) {
        var count = 0;
        if (obj && typeof obj === "object") {
            for (var ooo in obj) {
                if (obj.hasOwnProperty(ooo)) {
                    count++;
                }
            }
            return count;
        } else {
            throw new Error("argunment can not be null;");
        }
    }
    
    function compareArray(array1, array2) {
        if ((array1 && typeof array1 === "object" && array1.constructor === Array) && (array2 && typeof array2 === "object" && array2.constructor === Array)) {
            if (array1.length == array2.length) {
                for (var i = 0; i < array1.length; i++) {
                    var ggg = compareJson(array1[i], array2[i]);
                    if (!ggg) {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }
        else {
            throw new Error("argunment is  error ;");
        }
        return true;
    }

    return {
        showWorkingOnItDialog: showWorkingOnItDialog,
        closeLastDialog: closeLastDialog,
        parseCurrency: parseCurrency,
        newGuid: newGuid,
        isDate: isDate,
        parseDate: parseDate,
        toDateString: toDateString,
        getUrlParameter: getUrlParameter,
        showModalDialog: showModalDialog,
        trimString: trimString,
        isCurrentUserWebAdmin: isCurrentUserWebAdmin,
        htmlEscape: htmlEscape,
        initPopover: initPopover,
        getCurrentUser: getCurrentUser,
        transformDateToISO8601: transformDateToISO8601,
        transformIOSDateToen: transformIOSDateToen,
        addSDLinkAfterAppHome: addSDLinkAfterAppHome,
        compareJson: compareJson
    };

});