/*
This is a sample shared javascript file, 
you can delete it after you understand how to use shared folder.
*/

function closeLoadingDialog() {
    ExecuteOrDelayUntilScriptLoaded(function () {
        var dialog = SP.UI.ModalDialog.get_childDialog();
        if (typeof dialog !== undefined && dialog !== null) {
            dialog.close();
        }
    }, "sp.ui.dialog.js");
}