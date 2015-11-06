/*jslint browser: true, nomen: true, regexp: true, newcap: true*/
/*global SP, _spPageContextInfo, lazyLoad*/
(function () {
    "use strict";
    var pageRegex = /SitePages\/(home|sd|ss).*\.aspx/i;
    function init() {
        var showBody = false;
        function showBodyArea(flag) {

            showBody = flag;
            var body = document.body || document.getElementsByTagName('body')[0];
            if (showBody) {
                body.style.display = "block";
            } else {
                body.style.display = "none";
            }
        }

        function ensureBody() {
            var body = document.body || document.getElementsByTagName('body')[0];
            if (typeof body !== "undefined") {
                showBodyArea(showBody);
            } else {
                setTimeout(ensureBody, 100);
            }
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
        window.sp = {};
        window.sp.workingOnItDialog = undefined;
        window.sp.showBody = showBodyArea;

        if ((pageRegex.exec(location.pathname)) !== null) {
            ensureBody(false);
        }
    }

    init();
}());