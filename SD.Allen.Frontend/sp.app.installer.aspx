<%@ Page Language="C#" masterpagefile="~masterurl/default.master" inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" meta:webpartpageexpansion="full" %>

<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	hello, sp.app!
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
	hello, sp.app!
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
    <table id="spapp_info" style="padding:5px;border:none">
        <thead>
            <tr>
                <td>root</td>
                <td></td>
                <td>version</td>
                <td></td>
                <td>required scripts</td>
            </tr>
        </thead>
        <tbody>
            <tr style="vertical-align:top">
                <td><input id="spapp_root" type="text" value="~site/pages/assets" /></td>
                <td>/</td>
                <td><input id="spapp_version" type="text" value="trunk" /></td>
                <td>/</td>
                <td id="spapp_scripts"></td>
            </tr>
        </tbody>
    </table>
    <input id="spapp_install" type="button" value="detecting status..." disabled/>
    <p id="spapp_status"></p>
	<script>      
	    SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
	        var title = "sp.app.scripts",
                scripts = ["require.js", "sp.app.config.js", "sp.app.init.js"],
                rootNode = document.getElementById("spapp_root"),
                versionNode = document.getElementById("spapp_version"),
                scriptsNode = document.getElementById("spapp_scripts"),
                button = document.getElementById("spapp_install"),
                statusNode = document.getElementById("spapp_status"),
                client = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);

	        init();

	        function init() {
	            var paths = window.location.href.replace(_spPageContextInfo.webAbsoluteUrl, "").split("/");
	            paths.pop();
	            rootNode.value = "~site" + paths.join("/");
	            scriptsNode.innerText = scripts.join("\n");
	            checkStatus();	            
	        }

	        function checkStatus() {
	            var actions = client.get_web().get_userCustomActions();

	            client.load(actions);
	            client.executeQueryAsync(function () {
	                var index = actions.get_count() - 1,
	                    installed = false,
	                    action;

	                for (index; index >= 0; index -= 1) {
	                    action = actions.itemAt(index);
	                    if (action.get_title() == title) {
	                        var paths = action.get_scriptSrc().split("/");
	                        paths.pop();
	                        setAsUninistallable(paths.join("/"));
	                        installed = true;
	                        break;
	                    }
	                }
	                if (installed === false) {
	                    setInstallable();
	                }
	            }, function (s, a) {
	                button.disabled = false;
	                spapp_status.innerText = "failed: " + a.get_message();
	            });
	        }

	        function install() {
	            setAsProcessing();

	            var count = scripts.length,
	                index = 0,
	                root = rootNode.value,
                    version = versionNode.value;

	            if (root.endsWith("/") === false)
	                root = root + "/";
                if (version.endsWith("/") === false)
                    version = version + "/";
	            for (index; index < count; index += 1) {
	                var action = client.get_web().get_userCustomActions().add();
	                action.set_title(title);
	                action.set_location("ScriptLink");
	                action.set_scriptSrc(root + version + scripts[index]);
	                action.set_sequence(100 + index);
	                action.update();
	                client.load(action);
	            }
                client.executeQueryAsync(function () {
                    window.location.href = window.location.href;
                }, function (s, a) {
                    setInstallable();
                    spapp_status.innerText = "failed: " + a.get_message();
                });
	        }

	        function uninstall() {
	            setAsProcessing();

	            var actions = client.get_web().get_userCustomActions();
	            client.load(actions);
	            client.executeQueryAsync(function () {
	                var index = actions.get_count() - 1,
	                    installed = false;
	                for (index; index >= 0; index -= 1) {
	                    var action = actions.itemAt(index);
	                    if (action.get_title() == title) {
	                        action.deleteObject();
	                    }
	                }
	                client.executeQueryAsync(function () {
	                    window.location.href = window.location.href;
	                }, function (s, a) {
	                    setAsUnistallable();
	                    spapp_status.innerText = "failed: " + a.get_message();
	                });
	            }, function (s, a) {
	                button.disabled = false;
	                spapp_status.innerText = "failed: " + a.get_message();
	            });
	        }

	        function setAsProcessing() {
	            button.value = "processing...";
	            button.disabled = true;
	        }

	        function setAsUninistallable(installedPath) {
	            spapp_status.innerText = "installed at: " + installedPath;
	            button.value = "uninstall";
	            button.removeEventListener("click", install);
	            button.addEventListener("click", uninstall);
	            button.disabled = false;
	        }

	        function setInstallable() {
	            button.value = "install";
	            button.removeEventListener("click", uninstall);
	            button.addEventListener("click", install);
	            button.disabled = false;
	        }
	    });
	</script>
</asp:Content>