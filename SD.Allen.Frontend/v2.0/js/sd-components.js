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
            } else {
                return false;
            }
        } else {
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
define('model/Oppty', function (require) {
    'use strict';
    var $ = require('jquery'),
        opptyRESTAPI = sp.app.config.ENV.siteRelativeUrl + "/_api/web/Lists/getbytitle('" + sp.app.config.ListCollection.SDCore + "')";

    function Oppty(data) {
        var self = this;
        self.ID = 0;
        self.opptyID = '';
        self.opptyName = '';
        self.clientName = '';
        self.dealStatus = '';
        self.salesStage = '';
        self.statusCheck = '';
        self.json = {};

        if (data !== undefined) {
            self.ID = data.ID;
            self.opptyID = data.Title;
            self.opptyName = data.OpptyName;
            self.clientName = data.ClientName;
            self.dealStatus = data.DealStatus;
            self.salesStage = data.SalesStage;
            self.statusCheck = data.StatusCheck;
            self.json = data.JSON;
        }
    };

    function opptyOverview(oppty, productLine) {
        this.opptyID = oppty.OpportunityID;
        this.opptyName = oppty.OpportunityName;
        this.salesStage = oppty.CurrentSalesStage;
        this.opptyType = oppty.OpportunityType;
        this.dealStatus = oppty.OpportunityStatus;
        this.clientName = oppty.CustomerProfileName;
        this.leadBizUnit = oppty.PrimaryGBU;
        this.opptyTcv = oppty.OpportunityTotalValueUSD;
        this.opptyFyr = oppty.OpportunityTotalFFYRevenueUSD;
        this.apps = oppty.APPSUSD;
        this.bps = oppty.BPOUSD;
        this.ito = oppty.ITOUSD;
        //this.hpeOther = oppty.HPESOtherUSD;
        this.contractTerm = oppty.ContractLengthinMonths;
        this.contractSignDate = oppty.SignDate;
        this.leadCntry = oppty.ESSubregion;
        this.clientCntry = oppty.CRPCountryName;
        this.region = oppty.ESGeo;

        this.productLine = productLine;
    }

    function subProductLine(subProductLine) {
        this.serviceLine = subProductLine.LineItemProductLineName;
        this.offering = subProductLine.LineItemSubProductLineName;
    }

    function getAllOpptyAsync() {
        var oppties;
        var dfd = $.Deferred();
        $.ajax({
            url: opptyRESTAPI + "/items/?$select=OpptyID,OpptyName,ClientName",
            type: "get",
            dataType: "JSON",
            headers: {
                "accept": "application/JSON;odata=verbose",
                "content-type": "application/JSON;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                oppties = data.d.results;
                dfd.resolve(oppties);
            },
            async: true
        });
        return dfd.promise();
    };

    function getMyOpptyAsync() {
        var dfd = $.Deferred(), opptyCollection = [];
        $.ajax({
            url: opptyRESTAPI + "/items/?$select=ID,Title,OpptyID,OpptyName,ClientName,DealStatus,SalesStage",
            type: 'get',
            dataType: 'json',
            headers: {
                "accept": "application/JSON;odata=verbose",
                "content-type": "application/JSON;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var results = data.d.results;
                for (var i in results) {
                    var singleOppty = new Oppty(results[i]);
                    opptyCollection.push(singleOppty);
                }
                dfd.resolve(opptyCollection);
            }
        });
        return dfd.promise();
    };

    function getOpptyByIDAsync(opptyID) {
        var dfd = $.Deferred(), oppty = {};
        var opptyUrl = opptyRESTAPI + "/items/?$filter=OpptyID eq " + "'" + opptyID + "'";
        $.ajax({
            url: opptyRESTAPI + "/items/?$filter=OpptyID eq " + "'" + opptyID + "'",
            type: "get",
            dataType: "JSON",
            headers: {
                "accept": "application/JSON;odata=verbose",
                "content-type": "application/JSON;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                oppty = data.d.results;
                if (oppty.length == 0) {
                    //todo: no opp found, 
                    dfd.resolve();
                } else {
                    dfd.resolve(oppty[0]);
                }
            }
        });
        return dfd.promise();
    }

    function updateOpptyAsync(oppty) {
        var dfd = $.Deferred(), opptyCollection = [];
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'Title':'{0}','OpptyID':'{1}','JSON':'{2}'}}", oppty.opptyID, oppty.opptyID, oppty.JSON);
        $.ajax({
            url: opptyRESTAPI + "/items("+oppty.ID+")",
            method: "post",
            data: body,
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            },
            success: function (data) {
                dfd.resolve();
            }
        });
        return dfd.promise();
    }

    function updateOpptyOverviewAsync(oppty) {
        var dfd = $.Deferred(), opptyCollection = [];
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'Title':'{0}','OpptyID':'{1}','OpptyName':'{2}','ClientName':'{3}','DealStatus':'{4}','SalesStage':'{5}','JSON':'{6}'}}", oppty.title, oppty.opptyID, oppty.opptyName, oppty.clientName, oppty.dealStatus, oppty.salesStage, oppty.JSON);
        $.ajax({
            url: opptyRESTAPI + "/items(" + oppty.ID + ")",
            method: "post",
            data: body,
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            },
            success: function (data) {
                dfd.resolve();
            }
        });
        return dfd.promise();
    }

    function addNewOppty(oppty) {
        //params, title, opptyID, opptyName, clientName, dealStatus, salesStage, jsonData
        var dfd = $.Deferred();
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'Title':'{0}','OpptyID':'{1}','OpptyName':'{2}','ClientName':'{3}','DealStatus':'{4}','SalesStage':'{5}','JSON':'{6}'}}", oppty.title, oppty.opptyID, oppty.opptyName, oppty.clientName, oppty.dealStatus, oppty.salesStage, oppty.JSON);
        $.ajax({
            url: opptyRESTAPI + "/items",
            type: "post",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose"
            },
            success: function (data) {
                dfd.resolve(data);
            }
        });
        return dfd.promise();
    }


    //  using sample:
    //  opptyModel = require('model/Oppty'),
    //  opptyModel.getOpptyOverviewAsync().done(function (opptyOverview) {
    //    //operate opptyOverview;
    //  });
    function getOpptyOverviewAsync(opptyID) {
        var url = sp.app.config.WebAPI.HRSoln + "?id=" + opptyID;
        var opptyOverviewData = null;
        var dfd = $.Deferred();
        $.ajax({
            url: url,
            type: "get",
            dataType: "JSON",
            headers: {
                "accept": "application/JSON",
                "content-type": "application/JSON"
            },
            success: function (oppty) {
                if (oppty === undefined) {
                    dfd.resolve();
                } else {
                    var productLine = [];
                    var temp = oppty.__ProductLines;
                    for (var i in temp) {
                    	if (temp[i].serviceLine !== "") {
                    		productLine.push(new subProductLine(temp[i]));
                    	}
                    }
                    opptyOverviewData = new opptyOverview(oppty, productLine);
                    dfd.resolve(opptyOverviewData);
                }
            },
            error: function (xhr) {
            	if (xhr.status == "404") {
            		dfd.resolve(undefined);
            	}
            },
            async: true
        });
        return dfd.promise();
    }

    return {
        getMyOpptyAsync: getMyOpptyAsync,
        getAllOpptyAsync: getAllOpptyAsync,
        getOpptyByIDAsync: getOpptyByIDAsync,
        updateOpptyAsync: updateOpptyAsync,
        addNewOppty: addNewOppty,
        opptyOverview: opptyOverview,
        getOpptyOverviewAsync: getOpptyOverviewAsync,
        updateOpptyOverviewAsync: updateOpptyOverviewAsync
    }
});

define('model/RequestAPI', function (require) {
    "use strict";
    var $ = require("jquery");

    function getSectionTitleBySid(navTitle, sid) {
        for (var i in navTitle) {
            if (navTitle[i].sid === sid) return navTitle[i].title;
        }
        return "Error Title";
    }

    function getSectionNameBySid(navTitle, sid) {
        for (var i in navTitle) {
            if (navTitle[i].sid === sid) return navTitle[i].sectionName;
        }
        return "Error Section Name"
    }

    //dynamic section switch
    function createSectionModel(pursuitClassfication, involvedGbu, appsInscope) {
        if (pursuitClassfication === undefined) pursuitClassfication == 'A';
        if (appsInscope === undefined || involvedGbu != 'apps') appsInscope = false;
        return [
            new SectionNavigator('0201', 'Opportunity Overview', '', '0202', 'opportunity-data'),
            new SectionNavigator('0202', 'Pursuit Team Contacts', '0201', '0301', 'contacts'),
            new SectionNavigator('0301', 'Client Overview and Decision Factors', '0202', '030201', 'client-overview'),
            new SectionNavigator('030201', 'Sales Approach', '0301', '030202', 'sales-approach'),
            new SectionNavigator('030202', 'Competitors', '030201', '030203', 'competitors'),
            new SectionNavigator('030203', 'Message Map/Value Proposition', '030202', '030204', 'map-value-propositions'),
            new SectionNavigator('030204', 'Pricing Approach', '030203', '040101', 'pricing-approach'),
            new SectionNavigator('040101', 'All Offerings', '030204', '040102', 'all-offerings'),
            new SectionNavigator('040102', 'Key Scope Items', '040101',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040301' : '0402', 'key-scope-items'),
            new SectionNavigator('0402', 'Current State Client Architecture', '040102', '040301', 'client-architecture'),
            new SectionNavigator('040301', 'Summary',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040102' : '0402', '040302', 'summary'),
            new SectionNavigator('040302', 'Outsourcing CMO/TMO/FMO', '040301', '040303', 'xmo'),
            new SectionNavigator('040303', 'HR Solution', '040302', '040304', 'hr-solutions'),
            new SectionNavigator('040304', 'HPE Internal Challenges and Constraints', '040303',
                (involvedGbu == 'apps' && appsInscope) ? '040305' : '040307', 'company-challenges'),
            new SectionNavigator('040305', 'Design Parameters', '040304', '040306', 'design-params'),
            new SectionNavigator('040306', 'Deployment Strategy', '040305', '040307', 'deploy-strategy'),
            new SectionNavigator('040307', 'Additional Information',
                (involvedGbu == 'apps' && appsInscope) ? '040306' : '040304', '0404', 'additional-info'),
            new SectionNavigator('0404', 'Innovative Aspects of the Solution', '040307', '040501', 'innovative-aspects'),
            new SectionNavigator('040501', 'Delivery Strategies > Delivery Location Targets', '0404', '040505', 'location-targets'),
            new SectionNavigator('040505', 'Delivery Strategies > In-Scope Services Delivery Responsibility', '040501',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040503' : '040506', 'service-delivery-responsibilities'),
            new SectionNavigator('040506', 'Delivery Strategies > Client-Retained Services Delivery Responsibility', '040505', '040503', 'client-retained-responsibilities'),
            new SectionNavigator('040503', 'Delivery Strategies > Service Management & Integration Approach',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040505' : '040506', '0406', 'service-management'),
            new SectionNavigator('0406', 'Key Client Constraints', '040503',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '0201' : '0407', 'key-client-constraints'),
            new SectionNavigator('0407', 'Summary Costing Approach', '0406', '0201', 'costing-reports')
        ]
    }

    function SectionNavigator(sid, title, prevSid, nextSid, sectionName) {
        this.sid = sid;
        this.title = title;
        this.prevSid = prevSid;
        this.nextSid = nextSid;
        this.sectionName = sectionName;
    }

    function sidBaseGbu(involvedGbu, appsInscope, nsid, sksid) {
        if (involvedGbu == 'apps' && appsInscope) {
            return sksid
        }
        return nsid
    }

    function newSid(pursuitClassfication, nsid, sksid) {
        if (pursuitClassfication == 'A' || pursuitClassfication == 'B') {
            return sksid
        }
        return nsid
    }

    //file and folder operatetion
    function uploadFile(libname, filename, file) {
        uploadFileSync(libname, filename, file);
    }

    //foldername : /OPP-10872923/1
    function uploadtoSpecificFolder(libname, foldername, filename, file) {
        var dfd = $.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var buffer = evt.target.result;
                var completeUrl = _spPageContextInfo.siteServerRelativeUrl
                  + "/_api/web/getfolderbyserverrelativeurl('" + libname + foldername + "')/files"
                  + "/add(overwrite=true,url='" + filename + "')";

                $.ajax({
                    url: completeUrl,
                    type: "POST",
                    data: buffer,
                    processData: false,
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    },
                    success: function (data) {
                        dfd.resolve(data);
                    },
                    complete: function (data) {
                        dfd.resolve(data);
                    },
                    error: function (err) {
                        dfd.resolve(err);
                    }
                });
            }
        };
        reader.readAsArrayBuffer(file);
        return dfd.promise();
    }

    //Upload file synchronously
    function uploadFileSync(libname, filename, file) {
        var dfd = $.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var buffer = evt.target.result;
                var completeUrl = _spPageContextInfo.siteServerRelativeUrl
                  + "/_api/web/lists/getByTitle('" + libname + "')"
                  + "/RootFolder/Files/add(url='" + filename + "',overwrite='true')";

                $.ajax({
                    url: completeUrl,
                    type: "POST",
                    data: buffer,
                    processData: false,
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    },
                    success: function (data) {
                        dfd.resolve(data);
                    },
                    complete: function (data) {
                        dfd.resolve(data);
                    },
                    error: function (err) {
                        dfd.resolve(err);
                    }
                });
            }
        };
        reader.readAsArrayBuffer(file);
        return dfd.promise();
    }

    function createFolder(libname, opptyId, version) {
        var dfd = $.Deferred();
        var url = _spPageContextInfo.siteServerRelativeUrl
        + "/_api/web/lists/getByTitle('" + libname + "')"
        + "/RootFolder/Folders/add(url='" + opptyId + "')";
        $.ajax({
            "url": url,
            "type": "POST",
            "headers": {
                "accept": "application/json; odata=verbose",
                "content-type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                //dfd.resolve(data);
                createSubFolder(libname, opptyId, version);
            },
            complete: function (data) {
                dfd.resolve(data);
            },
            error: function (err) {
                dfd.resolve(err);
            }
        });
    }

    function createSubFolder(libname, opptyId, version) {
        var dfd = $.Deferred();
        var url = _spPageContextInfo.siteServerRelativeUrl
            + "/_api/Web/Folders/add('" + libname + "/" + opptyId + "/" + version + "')";
        $.ajax({
            "url": url,
            "type": "POST",
            "headers": {
                "accept": "application/json; odata=verbose",
                "content-type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                dfd.resolve(data);
            },
            complete: function (data) {
                dfd.resolve(data);
            },
            error: function (err) {
                dfd.resolve(err);
            }
        });
    }

    function getAllAttachments(opptyId) {
        var dfd = $.Deferred();
        var ver = sp.app.config.ReleaseVersion;
        var libname = sp.app.config.ListCollection.SSDocLib;
        var url = _spPageContextInfo.siteServerRelativeUrl
        + "/_api/web/getfolderbyserverrelativeurl('" + libname + "/" + opptyId + "/" + ver + "')/Files";
        $.ajax({
            url: url,
            type: "get",
            dataType: "JSON",
            headers: {
                "accept": "application/JSON;odata=verbose",
                "content-type": "application/JSON;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (err) {
                dfd.resolve(err);
            }
        });
        return dfd.promise();
    }

    //Oppty operation
    function getAllOpptyAsync() {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents',
            method: 'GET',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function getMyOpptyAsyc() {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/my',
            method: 'GET',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function createOpptyDocument(data) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function getOpptyByIDAsync(opptyID) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/' + opptyID,
            method: 'GET',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data, xhr);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function getOpptyByIDSync(opptyID) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/' + opptyID,
            method: 'GET',
            async: false,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data, xhr);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function getSectionByIDAndSectionNameAsync(opptyID, sectionName) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/' + sectionName,
            method: 'GET',
            contentType: 'application/json',
            headers: {

                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data, xhr);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    function getSectionByIDAndSectionNameSync(opptyID, sectionName) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/' + sectionName,
            method: 'GET',
            async: false,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            }
        }).done(function (data, status, xhr) {
            dfd.resolve(data, xhr);
        }).fail(function (xhr) {
            dfd.resolve(xhr);
        });
        return dfd.promise();
    }

    //section : update section data
    function updateSection(opptyID, sectionName, section, eTag) {
        var dfd = $.Deferred();
        $.ajax({
            url: sp.app.config.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/' + sectionName,
            method: 'POST',
            data: JSON.stringify(section),
            contentType: 'application/json',
            headers: {
                'If-Match': eTag,
                'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
            },
            success: function (data, textStatus, jqXHR) {
                dfd.resolve(data, textStatus, jqXHR);
            },
            error: function (xhr) {
                dfd.resolve(xhr);
            }
        });
        return dfd.promise();
    }

    //error message processing
    function errorOppty(code) {
        switch (code) {
            case '400':
                alert("You don't have OpptyID in your url! You will redirect to My Opportunity Page!");
                window.location.href = sp.app.config.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;
            case '404':
                alert("OpptyID is not avaiable! Please try another or navigator to home page!");
                window.location.href = sp.app.config.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;
            default: break;
        }
    }

    function errorUpdateSection(data, sid, opptyID) {
        var navTitle = createSectionModel(undefined, undefined, undefined);
        var secName = sid != null ? getSectionTitleBySid(navTitle, sid) : "";
        var updateMsg = "";
        var error = 0;
        if (data == undefined) {
            error = 0;
            updateMsg = "Update Section  Successfully!";//(" + secName + ")
        } else if (data.status >= 400 && data.status < 500) {
            error = data.status;
            if (sid == null) {
                if (data.status == 400) {
                    updateMsg = "Error: The length of the URL for this request exceeds the configured maxUrlLength value or object file too large .";
                }
                else {
                    updateMsg = "Error code: " + data.status;
                }
            } else {
                var errorText = JSON.parse(data.responseText);
                updateMsg = "Error: " + error + " Section: " + secName + ", Message: " + errorText.Message;
            }
        } else if (data.status >= 500) {
            error = data.status;
            updateMsg = "Error occur in the server, please contact the server administrator!";
        }
        $(window).trigger("generateMsg", [secName, error, updateMsg]);
        FixWorkspace();
    }

    //Unified handling save method
    function unifiedSave(submitFlag, obj, argu) {
        $(window).trigger("submitableChanged", {
            submitFlag: submitFlag,
            obj: obj,
            viewModel: argu
        });
    }

    //Fix the top banner was covered
    function FixWorkspace() {
        // if you are using a header that is affixed to the top (i.e. SharePoint Ribbon) put the ID or class here to change the workspace height accordingly.
        var header = '#suiteBar';
        var width = $(window).width();
        var height;
        if ($(header).length) {
            height = $(window).height() - $(header).height();
        } else {
            height = $(window).height();
        }
        $('#s4-workspace').width(width).height(height);
    }

    return {
        createSectionModel: createSectionModel,
        createFolder: createFolder,
        uploadFile: uploadFile,
        uploadtoSpecificFolder: uploadtoSpecificFolder,
        createOpptyDocument: createOpptyDocument,
        getAllAttachments: getAllAttachments,
        getAllOpptyAsync: getAllOpptyAsync,
        getMyOpptyAsyc: getMyOpptyAsyc,
        getSectionByIDAndSectionNameAsync: getSectionByIDAndSectionNameAsync,
        getSectionByIDAndSectionNameSync: getSectionByIDAndSectionNameSync,
        getOpptyByIDAsync: getOpptyByIDAsync,
        updateSection: updateSection,
        errorOppty: errorOppty,
        getOpptyByIDSync: getOpptyByIDSync,
        errorUpdateSection: errorUpdateSection,
        getSectionNameBySid: getSectionNameBySid,
        getSectionTitleBySid: getSectionTitleBySid,
        FixWorkspace: FixWorkspace,
        unifiedSave: unifiedSave
    }

});

define('component/TopLink', function (require) {
    "use strict";

    var ko = require("knockout"),
        bs = require("bootstrap"),
        templateHtml = require("text!./TopLinkTemplate.html");
    
    function createTopLinkViewModel(params, componentInfo) {
        var viewModel = {};

        
        return viewModel;
    }

    return {
        name: ["TopLink", "sd-toplink"],
        template: templateHtml,
        viewModel: { createViewModel: createTopLinkViewModel }
    };

});
define('component/TopLinkHome', function (require) {
    "use strict";

    var ko = require("knockout"),
        bs = require("bootstrap"),
        templateHtml = require("text!./TopLinkHomeTemplate.html");
    
    function createTopLinkViewModel(params, componentInfo) {
        var viewModel =  { };        
        viewModel.navToNewRequestForm = function () {
            location.href = "NewRequestForm.aspx";
        };        
       
        return viewModel;
    }

    return {
        name: ["TopLinkHome", "sd-toplink-home"],
        template: templateHtml,
        viewModel: { createViewModel: createTopLinkViewModel }
    };

});
/*global define, alert, console, location*/
define('component/OpptyID', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./OpptyIDTemplate.html");

    function onViewModelPreLoad() {}

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function (oppty) {
            var self = this;
            self.opptyID = ko.observable("");
            self.editable = ko.observable(false);
            if (oppty === undefined || oppty.opptyID === undefined) {
                //new oppty
                self.opptyID("OPP-");
                self.editable(true);
            } else {
                self.opptyID(oppty.opptyID);
                self.editable(false);
            }
            self.edit = function () {
                self.editable(true);
            };
            self.save = function () {
                self.editable(false);
            };
        };
        return new viewModel(params.oppty);
    }

    return {
        name: ["OpptyID", "sd-oppty-id"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/// <reference path="SDErrorPageTemplate.html" />
define('component/DateTimePicker', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        datetimepicker = require('datetimepicker'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./DateTimePickerTemplate.html");

    ko.bindingHandlers.dateTimePicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var obs = valueAccessor(),
                self = ko.bindingHandlers.dateTimePicker,
                options = allBindingsAccessor().dateTimePickerOptions || {},
                subscribeObs = function (obs) {
                    if (typeof obs.__updateSubscribe === "undefined") {
                        obs.__updateSubscribe = obs.subscribe(function (newVal) {
                            self.update(element, valueAccessor, allBindingsAccessor);
                        }, 100);
                    }
                };
            $(element).datetimepicker(options);

            //when a user changes the date, update the view model
            ko.utils.registerEventHandler(element, "dp.change", function (event) {
                var value = valueAccessor();
                if (ko.isObservable(value)) {
                    if (event.date != null && !(event.date instanceof Date)) {
                        //value(event.date.toDate());
                        if (event.date)
                            value(event.date.toISOString());
                        else
                            value('');
                    } else {
                        value(event.date);
                    }
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var picker = $(element).data("DateTimePicker");
                if (picker) {
                    picker.destroy();
                }
            });
            subscribeObs(obs);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                self = self = ko.bindingHandlers.dateTimePicker,
                picker = $(element).data("DateTimePicker");
            //when the view model is updated, update the widget
            if (picker) {
                var koDate = new Date(ko.utils.unwrapObservable(valueAccessor()));
                if (self.isValidDate(koDate)) {
                    picker.date(koDate);
                } else {
                    picker.date(null);
                }
            }
        },
        isValidDate: function (d) {
        if (Object.prototype.toString.call(d) === "[object Date]") {
            // it is a date
            if (isNaN(d.getTime())) {  // d.valueOf() could also work
                // date is not valid
                return false;
            }
            else {
                // date is valid
                return true;
            }
        }
        else {
            // not a date
            return false;
        };
    }
    };

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var dateTimePickerViewModel,
            viewModel = function (params, componentInfo) {
                var vm = {
                    guid: 'sd-dtPicker-' + appUtility.newGuid(),
                    dateTime: params.dateTime,
                    dateTimePickerOptions: {},
                    title: ko.observable(),
                    hint: ko.observable(),
                    mandatory: ko.observable(false),
                    editable: ko.observable(true),
                    formattext: function () {
                        return new Date(params.dateTime()).format("MMM dd yyyy");
                    },
                    edit: function () {
                        if (!vm.editable()) {
                            vm.editable(true);
                        }
                    },
                    editCompleted: function () {
                        if (vm.editable()) {
                            vm.editable(false);
                        }
                    }
                };
                if (params !== undefined) {
                    if (params.editable != undefined) {
                        vm.editable(params.editable());
                    }
                    if (params.title !== undefined) {
                        vm.title(params.title);
                    }
                    if (params.hint !== undefined) {
                        vm.hint(params.hint);
                    }
                    if (params.mandatory !== undefined) {
                        vm.mandatory(params.mandatory);
                    }
                    if (params.dateTimePickerOptions !== undefined) {
                        vm.dateTimePickerOptions = params.dateTimePickerOptions;
                    } else {
                        vm.dateTimePickerOptions= {
                            format: "YYYY-MM-DD",
                            sideBySide: true
                        };
                    }
                }
                return vm;
            };
        dateTimePickerViewModel = new viewModel(params, componentInfo);
        return dateTimePickerViewModel;
    }

    return {
        name: ["DateTimePicker", "sd-datetimepicker"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*
 *  Single question for SD.
on the web page, please use like below:
<sd-peoplepicker params="{title: 'test question', content: testquestion}"></sd-peoplepicker>
avaiable params:
title: question title (mandatory)
content: a ko.observable() used to store html content
hint: a place holder to show default message (todo)
mandatory: indicate whether the field should be mandatory (todo)
 * 
 */

/*jslint browser: true, newcap: true, nomen: true, regexp: true*/
/*global $,SP,define,SPSODAction, _spPageContextInfo, ko,EnsureScript,SPUtility,console, SPClientPeoplePicker,SPClientPeoplePicker_InitStandaloneControlWrapper,ExecuteOrDelayUntilScriptLoaded,_v_dictSod*/
define('component/PeoplePicker', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./PeoplePickerTemplate.html");

    ko.bindingHandlers.clientPeoplePicker = {
        currentId: 0,
        init: function (element, valueAccessor, allBindingsAccessor) {
            var obs = valueAccessor(),
                allBindings = allBindingsAccessor(),
                self = ko.bindingHandlers.clientPeoplePicker,
                currentElemId,
                subscribeObs = function (obs) {
                    if (typeof obs.__updateSubscribe === "undefined") {
                        obs.__updateSubscribe = obs.subscribe(function (newVal) {
                            self.updateUserValue(element, obs, allBindings);
                        }, 100);
                    }
                },
                disposeObs = function (obs) {
                    if (typeof obs.__updateSubscribe !== "undefined") {
                        obs.__updateSubscribe.dispose();
                        delete obs.__updateSubscribe;
                    }
                };
            self.currentId = self.currentId + 1;
            currentElemId = "ClientPeoplePicker" + self.currentId;
            if (!ko.isObservable(obs)) {
                throw "clientPeoplePicker binding requires an observable";
            }

            element.setAttribute("id", currentElemId);
            obs._peoplePickerId = currentElemId + "_TopSpan";
            self.initPeoplePicker(currentElemId, allBindings).done(function (picker) {
                obs._peoplePicker = picker;
                picker.OnUserResolvedClientScript = function (elementId, userInfo) {
                    var temp = [],
                        tempUser = {},
                        users = self.removeMultipleItem(element, userInfo),
                    hasError = picker.HasInputError || picker.HasServerError,
                    isResolved = true,
                    isRefresh = false;
                    $.each(users, function (i, user) {
                        if (/.*@hp\.com/ig.test(user.ResolveText) || (user.Resolved && /.*@hp\.com/ig.test(user.EntityData.Email)))
                        {
                            isRefresh = true;
                            if (user.Resolved) {
                                temp.push(user.EntityData.Email.replace(/@hp\.com/ig, "@hpe.com"));
                            } else {
                                temp.push(user.ResolveText.replace(/@hp\.com/ig, "@hpe.com"));
                            }
                        }
                        else {
                            if(user.Resolved) {
                                temp.push({
                                    title: user.DisplayText,
                                    name: user.Key,
                                    email: user.EntityData.Email,
                                    sipAddress: user.EntityData.SIPAddress == "" ? null : user.EntityData.SIPAddress,
                                    type: user.EntityType,
                                });
                            } else {
                                isResolved = false;
                            }
                        }
                    });
                    if (isRefresh) {
                        obs(temp);
                    } else {
                        if ((!isResolved && hasError) || isResolved) {
                            disposeObs(obs);
                            obs(temp);
                            subscribeObs(obs);
                        }
                    }
                };
                self.updateUserValue(element, obs, allBindings);
                subscribeObs(obs);
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (typeof obs.updateSubscribe !== "undefined") {
                    obs.updateSubscribe.dispose();
                    delete obs.updateSubscribe;
                }
            });
        },
        initPeoplePicker: function (elementId, allBindings) {
            var schema = {
                PrincipalAccountType: "User, DL, SecGroup, SPGroup",
                SearchPrincipalSource: 15,
                ResolvePrincipalSource: 15,
                MaximumEntitySuggestions: 10,
                width: '280px',
                AllowMultipleValues: (typeof (allBindings.multiple) !== "undefined" && allBindings.multiple === true)
            },
                dfd = $.Deferred();
            SPSODAction(["sp.js", "clienttemplates.js", "clientforms.js",
                "clientpeoplepicker.js", "autofill.js"], function () {
                    SPClientPeoplePicker_InitStandaloneControlWrapper(elementId, null, schema);
                    var picker = SPClientPeoplePicker.SPClientPeoplePickerDict[elementId + "_TopSpan"];
                    dfd.resolve(picker);
                });
            return dfd.promise();
        },

        removeMultipleItem: function (element, userInfo) {
            var existedItems = [],
                rlt = [];
            if (typeof userInfo !== "undefined" && userInfo.length > 0) {
                $.each(userInfo, function (i, a) {
                    if ($.inArray(a.Key, existedItems) !== -1) {
                        $(element).find(".sp-peoplepicker-resolveList [title='" + a.DisplayText + "']:eq(0)").parent().find(".sp-peoplepicker-delImage").click();
                    } else {
                        rlt.push(a);
                        existedItems.push(a.Key);
                    }
                });
            }
            return rlt;
        },
        getResolvedUserMails: function (peoplePicker) {
            var userInfos = peoplePicker.GetAllUserInfo(),
                rlt = [];
            $.each(userInfos, function (i, a) {
                if (a.IsResolved) {
                    rlt.push(a.EntityData.Email);
                }
            });
            return rlt;
        },
        getResolvedUserKeys: function (peoplePicker) {
            var userInfos = peoplePicker.GetAllUserInfo(),
                rlt = [];
            $.each(userInfos, function (i, a) {
                if (a.IsResolved) {
                    rlt.push(a.Key);
                }
            });
            return rlt;
        },
        updateUserValue: function (element, obs, allBindings) {
            var keys, updateKeys, allUpdateKeys, peoplePicker, newKeys,
                resolvedMails, resolvedKeys, removeTitles, $ele,
                elementId = $(element).attr("id"),
                self = ko.bindingHandlers.clientPeoplePicker;
            $ele = $("#" + elementId);
            peoplePicker = obs._peoplePicker;
            resolvedMails = self.getResolvedUserMails(peoplePicker);
            resolvedKeys = self.getResolvedUserKeys(peoplePicker);
            updateKeys = [];

            if (obs()) {
                if ($.isArray(obs())) {
                    $.each(obs(), function (i, a) {
                        updateKeys.push(a);
                    });
                } else {
                    updateKeys.push(obs());
                }
            }
            //new added user
            newKeys = [];
            allUpdateKeys = [];
            $.each(updateKeys, function (i, a) {
                var newKey;
                if (typeof a !== "undefined") {
                    if (typeof a === "string") {
                        newKey = a;
                    } else if (typeof a === "object") {
                        if (typeof a.email !== "undefined") {
                            newKey = a.email;
                        } else if (typeof a.name !== "undefined") {
                            newKey = a.name;
                        }
                    }
                }
                allUpdateKeys.push(newKey);
                if (typeof newKey !== "undefined") {
                    if ($.inArray(newKey, resolvedKeys) === -1 && $.inArray(newKey, resolvedMails) === -1) {
                        newKeys.push(newKey);
                    }
                }
            });

            //removed user
            removeTitles = [];
            //if user information changed on obs object directly, to keep consistence with obs object, people picker control also need to remove unexist user.
            $.each(peoplePicker.GetAllUserInfo(), function (i, a) {
                var inUse = false;
                if ($.inArray(a.Key, allUpdateKeys) === -1 && (typeof a.EntityData === "undefined" || $.inArray(a.EntityData.Email, allUpdateKeys) === -1)) {
                    removeTitles.push(a.DisplayText);
                }
            });
            $.each(removeTitles, function (i, a) {
                if (typeof a !== "undefined" && a.length > 0) {
                    $ele.find(".sp-peoplepicker-resolveList [title='" + a + "']:eq(0)").parent().find(".sp-peoplepicker-delImage").click();
                }
            });

            if (newKeys.length > 0) {
                // console.log(new Date() + "obs() before Sp pick: " + JSON.stringify(obs()));
                peoplePicker.AddUserKeys(newKeys.join(";"));
            }

            if ((typeof (allBindings.enable) !== "undefined" && allBindings.enable === false) || (typeof (allBindings.disable) !== "undefined" && allBindings.enable === true)) {
                peoplePicker.SetEnabledState(false);
                $("#" + elementId + " .sp-peoplepicker-delImage").css("display", "none");
            }
        }
    };

    function SPSODAction(sodScripts, onLoadAction) {
        var x;
        if (SP.SOD.loadMultiple) {
            for (x = 0; x < sodScripts.length; x = x + 1) {
                if (!_v_dictSod[sodScripts[x]]) {
                    SP.SOD.registerSod(sodScripts[x], '/_layouts/15/' + sodScripts[x]);
                }
            }
            SP.SOD.loadMultiple(sodScripts, onLoadAction);
        } else {
            ExecuteOrDelayUntilScriptLoaded(onLoadAction, sodScripts[0]);
        }
    }

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var peopleViewModel,
            viewModel = function (params, componentInfo) {
                var vm = {
                    guid: 'sd-people-' + appUtility.newGuid(),
                    users: params.users,
                    peopleOnly: params.peopleOnly,
                    multiple: params.multiple,
                    title: ko.observable(),
                    hint: ko.observable(),
                    mandatory: ko.observable(false),
                    editable: ko.observable(true),
                    edit: function () {
                        if (!vm.editable()) {
                            vm.editable(true);
                        }
                    },
                    editCompleted: function () {
                        if (vm.editable()) {
                            vm.editable(false);
                        }
                    },
                    isResolved: ko.observable()
                };
                if (params !== undefined) {
                    if (params.editable !== undefined) {
                        vm.editable(params.editable());
                    }
                    if (params.title !== undefined) {
                        vm.title(params.title);
                    }
                    if (params.hint !== undefined) {
                        vm.hint(params.hint);
                    }
                    if (params.mandatory !== undefined) {
                        vm.mandatory(params.mandatory);
                    }
                }
                return vm;
            };
        peopleViewModel = viewModel(params, componentInfo);
        return peopleViewModel;
    }

    return {
        name: ["PeoplePicker", "sd-peoplepicker"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*
 *  Single question for SD.
on the web page, please use like below:
<sd-questionarea params="{title: 'test question', content: testquestion}"></sd-questionarea>
avaiable params:
title: question title (mandatory)
content: a ko.observable() used to store html content
hint: a place holder to show default message (todo)
mandatory: indicate whether the field should be mandatory (todo)
 * 
 */

define('component/QuestionArea', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        ko_tinyMCE = require('ko_tinyMCE'),
        
        appUtility = require('util/AppUtility'),
        requestAPI = require('model/RequestAPI'),
        ko_bootstrap = require('ko_bootstrap'),
        templateHtml = require("text!./QuestionAreaTemplate.html");

    //http://stackoverflow.com/questions/9956958/changing-the-position-of-bootstrap-popovers-based-on-the-popovers-x-position-in
    function option(newID)
    {
        //make the popover placement auto
        var options = {
            container: 'body',
            html: true,
            trigger: "click",
            placement: function (context, source) {
                var position = $(source).position();
                if (position.left > 515) {
                    return "left";
                }
                if (position.left < 515) {
                    return "right";
                }
                if (position.top < 110) {
                    return "bottom";
                }
                return "top";
            },
            content: function () {
                return $('#sd-wrapper-' + newID).html();
            }
        };
        return options;
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

    function initPopover(viewModel) {
        var element;
        element = $('[id="' + viewModel.guid + '"] a[rel=popover]')
        element.popover({
            html: true,
            trigger: 'hover focus',
            delay: {"hide":5000},
            placement: function (context, source) {
                var position = $(source).position();
                if (position.left > 515) {
                    return "left";
                }
                if (position.left < 515) {
                    return "right";
                }
                if (position.top < 110) {
                    return "bottom";
                }
                return "auto";
            },
            title: function () {
                var titleStr = '<table border="0" width="100%"><tr>';
                var filePath = $(this).data('file');
                titleStr += '<td>File Information: ';
                if (filePath != null) titleStr += extractFileName(filePath);
                titleStr += '</td><td class="text-right"><a class="close" contenteditable="false" role="button" name="closePop">&nbsp;&times;</a></td>';
                titleStr += '</tr></table>';
                return titleStr;
            },
            content: function () {
                var contentHtml = '<div contenteditable="false">', filePath, extension;
                filePath = $(this).data('file');
                extension = extractFileExtenionName(filePath).toLowerCase();
                //generate the full file path
                filePath = sp.app.config.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filePath;
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        contentHtml += '<img src="' + filePath + '" style="max-width:550px;max-height:550px;" />'
                        contentHtml += "<hr>";  
                        break;
                    case 'doc':
                    case 'docx':
                    case 'xls':
                    case 'xlsx':
                    case 'ppt':
                    case 'pptx':
                    case 'pdf':
                    default:
                        contentHtml += '<hr>';
                        break;
                }
                contentHtml += '<ul>';
                contentHtml += '<li><a href="' + filePath + '" title="' + filePath + '" download>Download a copy</a></li>';
                contentHtml += "<ul>";
                contentHtml += '<div class="text-right"><a style="cursor:hand;" class="btn btn-default" name="closePop">Close</a></div>';
                contentHtml += "</div>";
                return contentHtml;
            }
        }).mouseover(function (e) {
            if(e.target.nextSibling.id){
                $('[rel=popover]').each(function () {
                    
                    if (!$(this).is(e.target)) {
                        $(this).popover('hide');
                    }
                });
            }
            var offset = $('.popover').offset();
            if(offset.top < 30)
                $('.popover').offset({top:30});
        });
        
    }

    function nth_occurrence(string, substr) {
        var i = string.indexOf(substr);
        return string.substr(i+1, string.length);
    }

    //title="File Information: '+file.name+'" data-file="' + fileUrl + '"
    function insertAttachment(viewModel) {
        var file = viewModel.fileUploader.prop('files')[0],
            extension = extractFileExtenionName(file.name).toLowerCase();
        sp.app.workingDialog.show("Uploading...");
        requestAPI.uploadtoSpecificFolder(sp.app.config.ListCollection.SSDocLib, "/" + viewModel.opptyID() + "/" + sp.app.config.ReleaseVersion, file.name, file).done(function (data) {
            sp.app.workingDialog.hide("Uploading...");
            //insert hyperlink to content
            if (data.status != undefined && data.status > 300) {
                requestAPI.errorUpdateSection(data, null, null);
                sp.app.workingDialog.show("Upload attachment failed");
                setTimeout(function () {
                    sp.app.workingDialog.hide("Upload attachment failed");
                }, 5000);
                return;
            } else {
                var fileUrl = nth_occurrence(data.d.ServerRelativeUrl, '/' + sp.app.config.ReleaseVersion + '/');
                var fileHtml = '';
                var extPic = '.gif';
                if ("jpg;#png;#gif;#doc;#docx;#xls;#xlsx;#ppt;#pptx".indexOf(extension) == -1) {
                    if ("#pdf".indexOf(extension) !== -1) {
                        extPic = '.png';
                    } else {
                        extension = "disc";
                    }
                }

                fileHtml = '<a class="btn" rel="popover" data-file="' + fileUrl + '"><img style="width: 16px; height: 16px; border: 0" src="/_layouts/images/ic' + extension + extPic + '" /></a>';
                viewModel.editor.execCommand('mceInsertContent', false, fileHtml);
                initPopover(viewModel);
            }            
        });
    }

    function myCustomOnInit(idSec) {
        $('#' + idSec + ' .mceToolbar').hide();
    }

    function onViewModelPreLoad() {
    }

    function onViewModelLoaded(viewModel) {
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        hidePopover();
    }

    function hidePopover() {
        $('.popover').popover('hide');
        $('.popover').remove();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var barconf1 = "code | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify  bullist numlist outdent indent | table | link image sd-attachment";
        var barconf2 = "code | styleselect | numlist outdent indent | table link image sd-attachment";
        var barconf = "";
        if (params.inLoop) {
            barconf = barconf2;
        } else {
            barconf = barconf1;
        }
        var questionViewModel,
            viewModel = function (params, componentInfo) {
                var self = this;
                var nguid = appUtility.newGuid();
                self.areaID = ko.observable();
                self.inLoop = ko.observable(false);
                self.guid = 'sd-question-' + nguid;                
                self.config = {
                    selector: '#sd-question-' + nguid,
                    theme: "modern",
                    menubar: false,
                    statusbar: false,
                    inline: true,
                    object_resizing: "table",
                    fix_list_elements : true,
                    convert_urls:false,
                    end_container_on_empty_block:true,
                    fixed_toolbar_container:'#' + self.guid + '-container',
                    plugins: [
                        "advlist autolink lists link pagebreak table code",
                    ],
                    toolbar1: barconf,
                    image_advtab: true,
                    file_browser_callback: function (field_name, url, type, win) {
                        if (type == 'image') {
                            $('#sd-img-' + self.guid).click();
                        }
                        return false;
                    },                    
                    setup: function (ed) {
                        self.editor = ed;
                        self.fileUploader = $('#' + self.guid + '-file');
                        ed.addButton('sd-attachment', {
                            text: '',
                            icon: 'image',
                            tooltip: 'Add Attachment',
                            onclick: function () {
                                //reset html5 file uploader. http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
                                self.fileUploader.replaceWith(self.fileUploader = self.fileUploader.clone(true));
                                //show html5 file uploader
                                self.fileUploader.click();
                            }
                        });                        
                        ed.on('focus', function () {
                            initPopover(self);
                        });
                        ed.on('init', function () {
                            myCustomOnInit(self.guid);              
                        });
                        ed.on('mouseup', function (e) {                           
                            if (e.target.nodeName.toLowerCase() == 'a') {
                                if (e.target.name != "closePop")
                                    window.open(e.target.href, "_blank");
                            }
                        });
                        ed.on('mousedown', function (e) {
                            if (e.target.nodeName.toLowerCase() == 'a') {
                                if (e.target.name == "closePop") {
                                    e.preventDefault(); return;
                                }
                            }
                        });
                        ed.on('blur', function (e) {
                            $('.popover').popover('hide');
                            $('.popover').remove();
                        });
                        ed.on('keydown', function (args,event) {
                            if (ed.getBody().textContent != "")
                            {
                                var range = ed.selection.getRng();
                                if (range.startOffset === 0 && event.keyCode === 8) {
                                    args.preventDefault();
                                    //return false;
                                }
                            }
                        });
                    }
                };
                
                self.editor = {};
                self.fileUploader = {};
                self.title = ko.observable();
                self.opptyID = ko.observable();
                self.version = ko.observable(1);
                self.popoverInitialized = ko.observable(false);
                self.content = ko.observable();
                self.hint = ko.observable();
                self.mandatory = ko.observable(false);
                self.editable = ko.observable(false);
                self.attachmentSelected = function (e) {
                    insertAttachment(self);
                };
                self.viewExpand = ko.observable(false);//show or hide the icon
                self.editTimes = ko.observable(0);//record if it was the first time to edit the question
                self.answerVisible = ko.observable(true); //if the answer is visible

                self.isStartEdit = ko.computed(function () {
                    if (self.editTimes() == 0) {
                        if (params.content() == undefined || params.content() == "" || params.content() == "<p></p>") {
                            return false;
                        }
                        return true;
                    }
                    return self.answerVisible();
                });

                self.unfoldAnsw = function () { //Unfold or fold the answer
                    if (self.isStartEdit() == false) {
                        self.answerVisible(true);
                    } else {
                        self.answerVisible(false);
                    }
                    self.editTimes(1);
                }

                self.msoverHandler = function () { //mouse enter the question                   
                    self.viewExpand(true);
                }

                self.msoutHandler = function () { //mouse out the question
                    self.viewExpand(false);
                }

                self.msupHandler = function () { //click the question component
                    if (!self.isStartEdit() || !self.answerVisible()) return true;
                    return false;
                };


                if (params !== undefined) {
                    if (params.content != undefined && params.content != null) {
                        if (typeof params.content === 'function') {
                            self.content = params.content;
                            //var temp = JSON.stringify(ko.toJS(self.content));
                            //if(params.content() != undefined)
                            //    self.editTimes(1);
                        } else {
                            self.content = ko.observable(params.content);
                        }
                    }
                    if (params.editable !== undefined) {
                        self.editable(params.editable());
                    }
                    if (params.inLoop !== undefined) {
                        self.inLoop(params.inLoop);
                    }
                    if (params.title !== undefined) {
                        self.title(params.title);
                    }
                    if (params.opptyID !== undefined) {
                        self.opptyID(params.opptyID);
                    }
                    if (params.version !== undefined) {
                        self.version(params.version);
                    }
                    if (params.hint !== undefined) {
                        self.hint(params.hint);
                    }
                    if (params.mandatory !== undefined) {
                        self.mandatory(params.mandatory);
                    }
                }
                self.opptyID(appUtility.getUrlParameter('OpptyID'));
                //Close a Twitter Bootstrap Popover when Clicking Outside
                
                $(function () {
                    
                    $('body').on('click', function (e) {
                        if (self.editable() === true) {
                            $('[rel="popover"]').each(function () {
                                //the 'is' for buttons that trigger popups
                                //the 'has' for icons within a button that triggers a popup
                                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.btn').has(e.target).length === 0) {
                                    $(this).popover('hide');
                                }
                            });
                        }
                        if (e.target.name == 'closePop') {
                            $('.popover').popover('hide');
                        }
                    });
                    $('a[rel="popover"]').mouseenter(function (e) {
                        if (self.editable() === false) {
                            togglePopover($(this), $(this).attr('data-file'), self);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                    
                    
                });                
            };
        questionViewModel = new viewModel(params, componentInfo);
        onViewModelLoaded(questionViewModel);
        return questionViewModel;
    }

    function togglePopover(element,filename,viewModel) {
        element.popover({
            html: true,
            trigger: 'click',
            //delay: { "hide": 3000 },
            placement: 'auto',
            title: 'File Information:' + filename,
            content: function () {
                var contentHtml = '<div contenteditable="false">';
                var extension = '';
                extension = extractFileExtenionName(filename).toLocaleLowerCase();
                var filePath = sp.app.config.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filename;
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        contentHtml += '<img src="' + filePath + '" style="max-width:550px;max-height:550px;" />'
                        contentHtml += "<hr>";  
                        break;
                    case 'doc':
                    case 'docx':
                    case 'xls':
                    case 'xlsx':
                    case 'ppt':
                    case 'pptx':
                    case 'pdf':
                    default:
                        contentHtml += '<hr>';
                        break;
                }
                contentHtml += '<ul>';
                contentHtml += '<li><a href="' + filePath + '" title="' + filePath + '" download>Download a copy</a></li>';
                contentHtml += "<ul>";
                contentHtml += '<div class="text-right"><a style="cursor:hand;" class="btn btn-default closePop" name="closePop">Close</a></div>';
                contentHtml += "</div>";
                return contentHtml;

            }
        });        
    }

    return {
        name: ["QuestionArea", "sd-questionarea"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define("component/AllOppty", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AllOpptyTemplate.html"),
        TopLink = require("./TopLink"),
        viewModel = {};

    function loadDataTables() {
        $('#table_sorting_paging').dataTable(
                {                    
                    'retrieve': true,
                    'paging': false,
                    dom: 'T<"clear">lfrtip'
                }
           )
    }

    function onViewModelPreLoad() {       
    }

    function onViewModelLoaded(viewModel) {
        getAllOppties(viewModel);
        $("body").show();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var allOpptyViewModel = function () {
            var self = this;
            self.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
            self.opptyList = ko.observable();
        };
        viewModel = new allOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getAllOppties(viewModel) {
        var vm = viewModel;
        sp.app.workingDialog.show("Retrieving All Opportunities..");
        requestAPI.getAllOpptyAsync().done(function (oppties) {
            vm.opptyList(oppties);
            sp.app.workingDialog.hide("Retrieving All Opportunities..");
            //loading table data after get oppties
            loadDataTables();
        });
    }
    return {
        name: ["AllOppty", "sd-alloppty"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };
});


/* global define */
define('component/AppHome', function (require) {
    "use strict";
    
    var $ = require("jquery"),
        ko = require("knockout"),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AppHomeTemplate.html"),
        TopLink = require("./TopLinkHome");
    
    function onViewModelPreLoad() { }

    function onViewModelLoaded(viewModel) {
        $("body").show();
        loadTop5Oppties(viewModel);
    }

    function loadTop5Oppties(viewModel) {
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            viewModel.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
            viewModel.opptyList(oppties);
        });
    }
    
    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        $("body").show();
        var viewModel,
            appHomeViewModel = function (params) {
                var self = this;
                self.opptyList = ko.observable();
        }
        viewModel = new appHomeViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    return {
        name: "AppHome",
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };

});
/*global define, alert, console, location*/
define('component/MyOppty', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./MyOpptyTemplate.html"),
        TopLink = require("./TopLink");

    function loadDataTables() {
        $('#table_sorting_paging').dataTable(
                {                    
                    'retrieve': true,
                    'paging': false,
                    dom: 'T<"clear">lfrtip'
                }
           )
    }

    function onViewModelPreLoad() {

    }
    function onViewModelLoaded(viewModel) {
        getMyOppties(viewModel);
        $("body").show();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var viewModel,
            myOpptyViewModel = function () {
                var self = this;
                self.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
                self.opptyList = ko.observable();
            };
        viewModel = new myOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getMyOppties(viewModel) {
        var vm = viewModel;
        sp.app.workingDialog.show("Retrieving My Opportunities..");
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            vm.opptyList(oppties);
            sp.app.workingDialog.hide("Retrieving My Opportunities..");
            //loading table data after get oppties
            loadDataTables();
        });
    }

    return {
        name: ["MyOppty", "sd-myoppty"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };
});


define('component/SDInputText', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./SDInputTextTemplate.html"),
        viewModel = {};
    
    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var inputTextViewModel = function (params, componentInfo) {
            var self = this;
            self.content = params.content;
            self.type = ko.observable('text'); //default type is text
            self.minVal = ko.observable(0);
            self.editable = ko.observable(true);
            self.hint = ko.observable();

            if (params != undefined && params != null) {                
                if (params.type != undefined) {
                    self.type(params.type);
                }
                if (params.minVal != undefined) {
                    self.minVal(params.minVal);
                }
                if (params.editable() != undefined) {
                    self.editable(params.editable());
                }
                if (params.hint !== undefined) {
                    self.hint(params.hint);
                }
            }
        };
        viewModel = new inputTextViewModel(params, componentInfo);

        return viewModel;
    }

    return {
        name: ["SDInputText", "sd-inputtext"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
define('component/SDErrorPage', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./SDErrorPageTemplate.html");


    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return viewModel;
    }

    return {
        name: ["SDErrorPage", "sd-errorpage"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
define('component/CountrySelector', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        select2 = require('select2'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./CountrySelectorTemplate.html"),
        vm = {};

    ko.bindingHandlers.option = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            ko.selectExtensions.writeValue(element, value);
        }
    };

    var countries2 = [
                new Map("AR", "Argentina"),
                new Map("BR", "Brazil"),
                new Map("CA", "Canada"),
                new Map("CL", "Chile"),
                new Map("CO", "Colombia"),
                new Map("CR", "Costa Rica"),
                new Map("MX", "Mexico"),
                new Map("OtherAMS", "Other AMS"),
                new Map("PA", "Panama"),
                new Map("PE", "Peru"),
                new Map("US", "United States"),
                new Map("AU", "Australia"),
                new Map("CN", "China"),
                new Map("HK", "Hong Kong"),
                new Map("IN", "India"),
                new Map("ID", "Indonesia"),
                new Map("JP", "Japan"),
                new Map("KR", "Korea"),
                new Map("MY", "Malaysia"),
                new Map("NZ", "New Zealand"),
                new Map("OtherAPJ", "Other APJ"),
                new Map("PH", "Philippines"),
                new Map("SG", "Singapore"),
                new Map("TW", "Taiwan"),
                new Map("TH", "Thailand"),
                new Map("VN", "Vietnam"),
                new Map("AT", "Austria"),
                new Map("BE", "Belgium"),
                new Map("BG", "Bulgaria"),
                new Map("CZ", "Czech Republic"),
                new Map("DK", "Denmark"),
                new Map("EG", "Egypt"),
                new Map("FI", "Finland"),
                new Map("FR", "France"),
                new Map("DE", "Germany"),
                new Map("GR", "Greece"),
                new Map("HU", "Hungary"),
                new Map("IE", "Ireland"),
                new Map("IL", "Israel"),
                new Map("IT", "Italy"),
                new Map("LU", "Luxembourg"),
                new Map("NL", "Netherlands"),
                new Map("NO", "Norway"),
                new Map("OtherEMEA", "Other EMEA"),
                new Map("PL", "Poland"),
                new Map("PT", "Portugal"),
                new Map("RO", "Romania"),
                new Map("RU", "Russia"),
                new Map("SA", "Saudi Arabia"),
                new Map("ZA", "South Africa"),
                new Map("ES", "Spain"),
                new Map("SE", "Sweden"),
                new Map("CH", "Switzerland"),
                new Map("TR", "Turkey"),
                new Map("AE", "UAE"),
                new Map("GB", "United Kingdom")

    ];

    var countries = [
            new Tree("AMS", [
                new Map("AR", "Argentina"),
                new Map("BR", "Brazil"),
                new Map("CA", "Canada"),
                new Map("CL", "Chile"),
                new Map("CO", "Colombia"),
                new Map("CR", "Costa Rica"),
                new Map("MX", "Mexico"),
                new Map("OtherAMS", "Other AMS"),
                new Map("PA", "Panama"),
                new Map("PE", "Peru"),
                new Map("US", "United States")
            ]),
            new Tree("APJ", [
                new Map("AU", "Australia"),
                new Map("CN", "China"),
                new Map("HK", "Hong Kong"),
                new Map("IN", "India"),
                new Map("ID", "Indonesia"),
                new Map("JP", "Japan"),
                new Map("KR", "Korea"),
                new Map("MY", "Malaysia"),
                new Map("NZ", "New Zealand"),
                new Map("OtherAPJ", "Other APJ"),
                new Map("PH", "Philippines"),
                new Map("SG", "Singapore"),
                new Map("TW", "Taiwan"),
                new Map("TH", "Thailand"),
                new Map("VN", "Vietnam")
            ]),
            new Tree("EMEA", [
                new Map("AT", "Austria"),
                new Map("BE", "Belgium"),
                new Map("BG", "Bulgaria"),
                new Map("CZ", "Czech Republic"),
                new Map("DK", "Denmark"),
                new Map("EG", "Egypt"),
                new Map("FI", "Finland"),
                new Map("FR", "France"),
                new Map("DE", "Germany"),
                new Map("GR", "Greece"),
                new Map("HU", "Hungary"),
                new Map("IE", "Ireland"),
                new Map("IL", "Israel"),
                new Map("IT", "Italy"),
                new Map("LU", "Luxembourg"),
                new Map("NL", "Netherlands"),
                new Map("NO", "Norway"),
                new Map("OtherEMEA", "Other EMEA"),
                new Map("PL", "Poland"),
                new Map("PT", "Portugal"),
                new Map("RO", "Romania"),
                new Map("RU", "Russia"),
                new Map("SA", "Saudi Arabia"),
                new Map("ZA", "South Africa"),
                new Map("ES", "Spain"),
                new Map("SE", "Sweden"),
                new Map("CH", "Switzerland"),
                new Map("TR", "Turkey"),
                new Map("AE", "UAE"),
                new Map("GB", "United Kingdom")
            ])
    ];
    
    function Map(key, value) {
        //this.key = ko.observable(key);
        //this.value = ko.observable(value);
        return {
            key: key,
            value:value
        }
    }

    function Tree(label, mapList) {
        //this.label = ko.observable(label);
        //this.mapList = ko.observableArray(mapList);
        return {
            label: label,
            mapList:mapList
        }
    }

    function extractCntry(codeArray) {
        var extractCnties = [];
        for (var i in codeArray) {
            extractCnties.push(codeArray[i].text);
        }
        return extractCnties;
    }

    function onViewModelPreLoad() {
        //$('#countries').select2({ tags: true });
    }

    function onViewModelLoaded(viewModel) {
        //$('#countries').val(vm.data()).trigger("change");
        //vm.selectedcountries(extractCntry($('#countries').select2('data')));
        //$('#countries').select2('container').hide();        
        var extractCnties = [];
        for (var i in vm.data()) {
            for (var j in countries2) {
                if (vm.data()[i] === countries2[j].key) {
                    extractCnties.push(countries2[j].value);
                }
            }
        }
        vm.selectedcountries(extractCnties);
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var  componentViewModel = function (params, componentInfo) {
                var self = this;
                self.guid = 'sd-cntry-' + appUtility.newGuid();
                self.title = ko.observable();
                self.data = params.data;
                self.editable = ko.observable(true);

                self.selectedcountries = ko.observable();

                if (params !== undefined) {
                    if (params.editable != undefined) {
                        vm.editable = params.editable();
                    }
                    if (params.title !== undefined) {
                        vm.title = params.title;
                    }
                }
            };
        vm = new componentViewModel(params, componentInfo);
        onViewModelLoaded(vm);
        return vm;
    }

    return {
        name: ["CountrySelector", "sd-countryselector"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
define('component/ReviewAndExtract', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        TopLink = require("./TopLink"),        
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./ReviewAndExtractTemplate.html"),
        section0201 = require('./Section0201'),
        section0202 = require('./Section0202'),
        section0301 = require('./Section0301'),
        section030201 = require('./Section030201'),
        section030202 = require('./Section030202'),
        section030203 = require('./Section030203'),
        section030204 = require('./Section030204'),
        section040101 = require('./Section040101'),
        section040102 = require('./Section040102'),
        section0402 = require('./Section0402'),
        section040301 = require('./Section040301'),
        section040302 = require('./Section040302'),
        section040303 = require('./Section040303'),
        section040304 = require('./Section040304'),
        section040305 = require('./Section040305'),
        section040306 = require('./Section040306'),
        section040307 = require('./Section040307'),
        section0404 = require('./Section0404'),
        section040501 = require('./Section040501'),
        section040502 = require('./Section040502'),
        section040503 = require('./Section040503'),
        section040504 = require('./Section040504'),
        section040505 = require('./Section040505'),
        section040506 = require('./Section040506'),
        section0406 = require('./Section0406'),
        section0407 = require('./Section0407'),
        appUtility = require('util/AppUtility'),
        viewModel = {};

    function onViewModelPreLoad() {       
        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });       
    }

    function onViewModelLoad(viewModel) {
        //getAllAttachments();
        $('body').show();
    }

    function getAllAttachments() {
        requestAPI.getAllAttachments(viewModel.opptyID()).done(function (data) {
            var filelist = data.d.results;
            for (var i in filelist) {
                
            }
        });
    }

    function loadingDocument(viewModel) {
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        if (viewModel.opptyID() === "") {
            requestAPI.errorOppty('400');
        } else {
            sp.app.workingDialog.show("Retrieving Document...");
            requestAPI.getOpptyByIDSync(viewModel.opptyID()).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status >= 400) {
                    requestAPI.errorOppty('' + oppty.status);
                } else {
                    if (oppty.data != undefined && oppty.data != null) {
                        viewModel.document(oppty.data);
                        var data = oppty.data.opptyOverview.opptyData.data;
                        viewModel.pursuitClassfication(data.pursuitClassfication);
                        if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                            viewModel.involvedGbu('apps');
                            viewModel.appsInscope(data.involvedGbu.apps.inScope);
                        }
                        viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));
                    }
                }
                sp.app.workingDialog.hide("Retrieving Document...");
            });
            //getAllAttachments();//get all attachment
        }

    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var reviewAndExtractviewModel = function (params, componentInfo) {
            var self = this;
            self.document = ko.observable();// the entire document
            self.editable = ko.observable(false);
            self.opptyID = ko.observable();

            self.sdContentUrl = sp.app.config.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();
            self.sectionNavigator = ko.observable();
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            loadingDocument(self);
            
            $('#sd-section-navbtn').click(function (e) {
                requestAPI.FixWorkspace();
                e.preventDefault();
            });

            $('a').on('click', function () {
                var href = $(this).attr('href');                
                requestAPI.FixWorkspace();
            });
            $("a[href='#top']").on('click',function () {
                $(window).scrollTop(0);
                return false;
            });
        };
        viewModel = new reviewAndExtractviewModel(params, componentInfo);
        onViewModelLoad(viewModel);
        return viewModel;
    }

    return {
        name: ["ReviewAndExtract", "sd-review-extract"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [
            section0201,
            section0202,
            section0301,
            section030201,
            section030202,
            section030203,
            section030204,
            section040101,
            section040102,
            section0402,
            section040301,
            section040302,
            section040303,
            section040304,
            section040305,
            section040306,
            section040307,
            section0404,
            section040501,
            section040502,
            section040503,
            section040504,
            section040505,
            section040506,
            section0406,
            section0407,
            TopLink
        ]
    };

});
define('component/AttachmentManager', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./AttachmentManagerTemplate.html"),
		requestAPI = require('model/RequestAPI'),

        appUtility = require('util/AppUtility'),
        vm = {};

    function listenCustomEvent() {
        $(window).off("sectionChanging");
        $(window).on("opptySaving", function () {
            $(document).undelegate('[id^=sd-file-]', 'click');
            if (vm.attachmentVisible) {
                hideAttachment();
            }
        });
    }

    function attachment(title, link, fileName, fileUrl, fileTag) {
        this.title = title;
        this.link = link;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileTag = fileTag;
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        $(function ($) {
            $(window).bind('mousewheel', function (event, delta) {
                if (vm.attachmentVisible) {
                    hideAttachment();
                }
            });
        });
    }

    function showAttachment() {
        $('.popover-option').popover('show');
        vm.attachmentVisible = true;
    }

    function hideAttachment() {
        $('.popover-option').popover('hide');
        vm.attachmentVisible = false;
    }

    function onViewModelLoaded() {
        function initPopover() {
            $(".popover-option").popover({
                html: true,
                content: function () {
                    return $("#div-attachmentReview").html();
                }
            });
        }
        $(initPopover());
        var regx = /^sd-file-.*/;

        $('.popover-option').off("click");
        $('.popover-option').click(function (e) {
            $('.popover-option').popover('toggle');
            e.stopPropagation();
            if (vm.attachmentVisible) {
                hideAttachment();
            } else {
                showAttachment();
            }
        });

        //$(document).off('[id^=sd-file-]', 'click');
        $(document).delegate('[id^=sd-file-]', 'click', function (e) {
            e.stopPropagation();
            var idStr = $(this).attr('id');
            var index = idStr.substring(8);
            vm.removeFile(index);
            showAttachment();
            return;
        });

        $(document).delegate('#sd-popover-close', 'click', function (e) {
            e.stopPropagation();
            $('.popover-option').popover('toggle');
            hideAttachment();
        });

        if (!vm.editable()) {
            initFileList();
        }
    }

    function initFileList() {
        vm.fileList([]);
        for (var i in vm.attachment()) {
            var fileTag = computePicSrc(vm.attachment()[i].title);
            vm.fileList.push(new attachment(vm.attachment()[i].title, vm.linkBaseUrl + vm.attachment()[i].title, vm.attachment()[i].title, vm.attachmentBaseUrl() + vm.attachment()[i].title, fileTag));
        }
    }

    function updateFileList() {
        if (!vm.attachmentLoaded) {
            initFileList();
            vm.attachmentLoaded = true;
        }
    }

    function uploader(vm) {
        var me = this;
        me.guid = 'sd-clientArchitecture-' + appUtility.newGuid();
        me.baseUrl = "/" + vm.section.opptyID + "/";
        me.attachmentSelected = function (e) {
            insertAttachment(me);
        };
        me.chooseFile = function () {
            $('#' + me.guid + '-file').click();
        }
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

    function computePicSrc(fileName) {
        var extension = extractFileExtenionName(fileName).toLowerCase();
        var extPic = '.gif';
        if ("jpg;#png;#gif;#doc;#docx;#xls;#xlsx;#ppt;#pptx".indexOf(extension) == -1) {
            if ("#pdf".indexOf(extension) !== -1) {
                extPic = '.png';
            } else {
                extension = "disc";
            }
        }
        var fileTag = '/_layouts/images/ic' + extension + extPic;
        return fileTag;
    }

    function insertAttachment(uploader) {
        var file = $('#' + uploader.guid + '-file').prop('files')[0];
        sp.app.fileUploadinDialog.show("Uploading files ...");
        requestAPI.uploadtoSpecificFolder(sp.app.config.ListCollection.SSDocLib, uploader.baseUrl + sp.app.config.ReleaseVersion, file.name, file).done(function (data) {
            sp.app.fileUploadinDialog.hide("Uploading files ...");
            var fileUrl = data.d.ServerRelativeUrl;
            var fileTag = computePicSrc(file.name);
            vm.attachment.push({ title: file.name, link: sp.app.config.ReleaseVersion + "/" + file.name });
            if (vm.attachmentLoaded) {
                vm.fileList.push(new attachment(file.name, sp.app.config.ReleaseVersion + "/" + file.name, file.name, fileUrl, fileTag));
            }
            showAttachment();
        });
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var attachmentManagerViewModel = function (params) {
            var self = this;

            self.linkBaseUrl = "/" + params.viewModel.section.opptyID + "/";
            self.attachmentBaseUrl = ko.observable(sp.app.config.ENV.SDDocLibUrl + params.viewModel.section.opptyID + "/" + sp.app.config.ReleaseVersion + "/");

            self.attachment = params.viewModel.section.data.attachment;
            self.editable = params.viewModel.editable;
            self.attachment.subscribe(updateFileList);
            self.fileList = ko.observableArray();
            self.fileUploader = new uploader(params.viewModel);

            self.attachmentLoaded = false;
            self.attachmentVisible = false;
            //define functions;
            self.removeFile = function (index) {
                var tempAttachment = self.attachment();
                tempAttachment.splice(index, 1);
                self.attachment(tempAttachment);

                var tempFileList = self.fileList();
                tempFileList.splice(index, 1);
                self.fileList(tempFileList);
            };
        };
        vm = new attachmentManagerViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["AttachmentManager", "sd-component-attachmentmanager"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});
define('component/DollarFormatter', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./DollarFormatterTemplate.html"),
        vm = {};

    function createViewModel(params, componentInfo) {
        var dollarFormatterViewModel = function (params) {
            var self = this;
            self.dollarValue = params.dollarValue;
            //define functions;
            self.getFormattedDollar = function (dollarValue) {
                var dollarStr = dollarValue.toString();
                var formatted = "";
                var l = dollarStr.length;
                var count = 0;
                for (var i = l - 1; i >= 0; --i) {
                    count = count + 1;
                    formatted = dollarStr.charAt(i) + formatted;
                    if (count % 3 === 0 && count < l) {
                        formatted = "," + formatted;
                    };
                }
                formatted = "$" + formatted;
                return formatted;
            }

            self.formattedDollar = ko.observable(self.getFormattedDollar(self.dollarValue()));
        };
        vm = new dollarFormatterViewModel(params);
        return vm;
    }

    return {
        name: ["DollarFormatter", "sd-component-dollarformatter"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});
/*global define, alert, location*/
define('component/Section0201', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dateTimePicker = require('./DateTimePicker'),
        templateHtml = require("text!./Section0201Template.html"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        numBox = require('numBox'),
        requestAPI = require('model/RequestAPI'),
        dollarFormatter = require('./DollarFormatter'),
        vm = {},
        sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        initNumBox();
    }

    function initNumBox() {
        $('.inputUSD').NumBox({ symbol: "$", max: Math.pow(10, 20), min: 0,places:0});
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        //get oppty id from query string
        if (vm.section.opptyID === "") {
            //new oppty
            vm.isNewOppty(true);
            // loadGripData();
        } else {
            loadSection();
            //loadOpptyData(vm.section.opptyID);
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        vm.editable(sectionLoaderViewModel.editable());
        var data = sectionLoaderViewModel.document();
        if (data === undefined) {
            loadOpptyData(vm.section.opptyID);
        } else {
            if (data.opptyOverview !== undefined && data.opptyOverview.opptyData !== undefined) {
                var opptyData = data.opptyOverview.opptyData.data;
                doDataBinding(opptyData);
            }
        }
    }

    function updateLeadGBU(newGBU) {
        switch (newGBU) {
            case 'apps':
                vm.data.involvedGbu.apps().inScope(true);
                break;
            case 'bps':
                vm.data.involvedGbu.bps().inScope(true);
                break;
            case 'ess':
                vm.data.involvedGbu.ess().inScope(true);
                break;
            case 'ito':
                vm.data.involvedGbu.ito().inScope(true);
                break;
            case 'hpeOther':
                vm.data.involvedGbu.hpeOther().inScope(true);
                break;
            case 'hpi':
                vm.data.involvedGbu.hpi().inScope(true);
                break;
            default:
                vm.data.involvedGbu.ito().inScope(true);
                break;
        }
		
    }
    function updateRegion(region) {
        region = region.toLowerCase();
        switch (region) {
            case 'ams':
                vm.data.region.ams().inScope(true);
                break;
            case 'apj':
                vm.data.region.apj().inScope(true);
                break;
            case 'emea':
                vm.data.region.emea().inScope(true);
                break;
            case 'na':
                vm.data.region.ams().inScope(false);
                vm.data.region.apj().inScope(false);
                vm.data.region.emea().inScope(false);
                break;
        }
        if (region == 'na') {
            vm.data.leadRegion('NA');
            if (sectionLoaderViewModel.document() !== null && sectionLoaderViewModel.document() !== undefined) {
                sectionLoaderViewModel.document().opptyOverview.opptyData.data.leadRegion = 'NA';
            }
        } else {
            vm.data.leadRegion(region);
            if (sectionLoaderViewModel.document() !== null && sectionLoaderViewModel.document() !== undefined) {
                sectionLoaderViewModel.document().opptyOverview.opptyData.data.leadRegion = region;
            }
        }
    }

    function updateLeadRegion(newCntry) {
        if (typeof newCntry === 'string') {
            var region = $('[id="sd-leadCntry"] option[value="' + newCntry + '"]').parent().attr('label');
            if (newCntry != 'NA' && region !== undefined && region !== null) {
                updateRegion(region);
            }
            if (newCntry == 'NA') {
                updateRegion("NA");
            }
        }
    }
    //clear value of Tcv or Fyr when the relavant unit is not in Scope;
    function updateInvolvedGbu(inScope, gbuName) {
        switch (gbuName) {
            case 'apps':
                if (!inScope) {
                    vm.data.involvedGbu.apps().tcv(0);
                    vm.data.involvedGbu.apps().fyr(0);
                }
                break;
            case 'bps':
                if (!inScope) {
                    vm.data.involvedGbu.bps().tcv(0);
                    vm.data.involvedGbu.bps().fyr(0);
                }
                break;
            case 'ito':
                if (!inScope) {
                    vm.data.involvedGbu.ito().tcv(0);
                    vm.data.involvedGbu.ito().fyr(0);
                }
                break;
            case 'ess':
                if (!inScope) {
                    vm.data.involvedGbu.ess().tcv(0);
                    vm.data.involvedGbu.ess().fyr(0);
                }
                break;
            case 'hpeOther':
                if (!inScope) {
                    vm.data.involvedGbu.hpeOther().tcv(0);
                    vm.data.involvedGbu.hpeOther().fyr(0);
                }
                break;
            case 'hpi':
                if (!inScope) {
                    vm.data.involvedGbu.hpi().tcv(0);
                    vm.data.involvedGbu.hpi().fyr(0);
                }
                break;
        }
    }

    function updateGlabalDocument(inScope, region) {
        if (!vm.isNewOppty()) {
            sectionLoaderViewModel.document().opptyOverview.opptyData.data.region[region].inScope = inScope;
        }
    }

    function executeVerifications() {
        if (checkRequiredField() === true && checkIdFormat(vm.data.opptyID()) === true && checkContractDate() === true && compareFryAndTcv() === true) {
            return true;
        } else {
            return false;
        }
    }

    function saveOppty(event, argu) {
        if (executeVerifications() === true) {
            var sid = argu.sid();
            if (sid !== '0201') {
                return;
            }
            if (verifyOpptyTcvAndOpptyFyr(vm) !== true && confirm("The Opportunity TCV should be equal to the combined total of all GBU TCV. The Opportunity FYR should be equal to the combined total of all GBU FYR.Are you sure to save?") === false) {
                return;
            }
            if (vm.isNewOppty()) {
                sp.app.workingDialog.show("Saving opportunity overview.");
                requestAPI.createOpptyDocument(ko.toJS(vm.data)).done(function (data) {
                    sp.app.workingDialog.hide("Saving opportunity overview.");
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    if (data != undefined && data.status == undefined) {
                        sid = "0202";
                        window.location.href = sp.app.config.ENV.SectionLoaderUrl + "?sid=" + sid + "&OpptyID=" + vm.data.opptyID();
                    }
                });
            } else {
                vm.data.pursuitWeb.link(vm.data.pursuitWeb.link());
                requestAPI.unifiedSave(true, ko.toJS(vm.data), argu);
                //window.localStorage.setItem(vm.section.opptyID + "_" + vm.section.name, JSON.stringify(ko.toJS(vm.data)));
                //console.log("save " + vm.section.opptyID + "_" + vm.section.name);
                //console.log(ko.toJS(vm.data));
            }
        } else {
        }
    }

    function loadOpptyData(opptyID) {
        var dataStr = window.localStorage.getItem(opptyID + "_" + vm.section.name);
        sp.app.workingDialog.show("Loading opportunity overview .");
        requestAPI.getSectionByIDAndSectionNameAsync(opptyID, vm.section.name).done(function (oppty, xhr) {
            sp.app.workingDialog.hide("Loading opportunity overview .");
            if (oppty.data === undefined) {
                vm.data.opptyID(opptyID);
            } else {
                vm.section.eTag = xhr.getResponseHeader('ETag');
                var data = oppty.data.opptyOverview.opptyData.data;
                doDataBinding(data);
            }
        }).then(function (oppty) {
            //query sales force
        });
    }

    function doDataBinding(data) {
        vm.data.opptyID(data.opptyId);
        vm.data.opptyName(data.opptyName);
        vm.data.salesStage(data.salesStage);
        vm.data.opptyType(data.opptyType);
        vm.data.dealStatus(data.dealStatus);
        vm.data.clientName(data.clientName);
        vm.data.opptyTcv(data.opptyTcv);
        vm.data.opptyFyr(data.opptyFyr);
        vm.data.leadBizUnit(data.leadBizUnit);
        vm.data.contractTerm(data.contractTerm);
        vm.data.leadCntry(data.leadCntry);
        vm.salesStageName($("#sd-SalesStage option[value='" + data.salesStage + "']").attr("label"));
        vm.leadCntryName($("#sd-Cntry option[value='" + data.leadCntry + "']").attr("label"));
        vm.data.clientCntry(data.clientCntry);
        vm.clientCntryName($("#sd-Cntry option[value='" + data.clientCntry + "']").attr("label"));
        vm.data.involvedGbu.apps().inScope(data.involvedGbu.apps.inScope);

        vm.data.involvedGbu.bps().inScope(data.involvedGbu.bps.inScope);
        vm.data.involvedGbu.ito().inScope(data.involvedGbu.ito.inScope);
        vm.data.involvedGbu.hpeOther().inScope(data.involvedGbu.hpeOther.inScope);
        vm.data.involvedGbu.ess().inScope(data.involvedGbu.ess.inScope);
        vm.data.involvedGbu.hpi().inScope(data.involvedGbu.hpi.inScope);

        vm.data.involvedGbu.apps().tcv(data.involvedGbu.apps.tcv);
        vm.data.involvedGbu.bps().tcv(data.involvedGbu.bps.tcv);
        vm.data.involvedGbu.ito().tcv(data.involvedGbu.ito.tcv);
        vm.data.involvedGbu.hpeOther().tcv(data.involvedGbu.hpeOther.tcv);
        vm.data.involvedGbu.ess().tcv(data.involvedGbu.ess.tcv);
        vm.data.involvedGbu.hpi().tcv(data.involvedGbu.hpi.tcv);

        vm.data.involvedGbu.apps().fyr(data.involvedGbu.apps.fyr);
        vm.data.involvedGbu.bps().fyr(data.involvedGbu.bps.fyr);
        vm.data.involvedGbu.ito().fyr(data.involvedGbu.ito.fyr);
        vm.data.involvedGbu.hpeOther().fyr(data.involvedGbu.hpeOther.fyr);
        vm.data.involvedGbu.ess().fyr(data.involvedGbu.ess.fyr);
        vm.data.involvedGbu.hpi().fyr(data.involvedGbu.hpi.fyr);

        vm.data.clientCntry(data.clientCntry);
        if (data.contractSignDate != null) {
            vm.data.contractSignDate(data.contractSignDate);
        }
        if (data.contractStartDate != null) {
            vm.data.contractStartDate(data.contractStartDate);
        }
        vm.data.pursuitClassfication(data.pursuitClassfication);
        vm.data.solnGovTrack(data.solnGovTrack);

        vm.data.region.ams().inScope(data.region.ams.inScope);
        vm.data.region.apj().inScope(data.region.apj.inScope);
        vm.data.region.emea().inScope(data.region.emea.inScope);

        vm.data.pursuitWeb.title(data.pursuitWeb.title);
        vm.data.pursuitWeb.link(data.pursuitWeb.link);

        initNumBox();
    }

    function loadGripData(opptyID) {
        if (opptyID !== undefined && opptyID !== "") {
            sp.app.workingDialog.show("Loading opportunity data from grip.");
            requestAPI.getOpptyByIDAsync(opptyID).done(function (xhr) {
                sp.app.workingDialog.hide("Loading opportunity data from grip.");
                if (xhr.status == "404") {
                    vm.existedInSystem(false);
                    vm.isNewOppty(true);
                    sp.app.workingDialog.show("Checking if the opportunity is existed on server.");
                    opptyModel.getOpptyOverviewAsync(opptyID).done(function (opptyOverview) {
                        sp.app.workingDialog.hide("Checking if the opportunity is existed on server.");
                        if (opptyOverview == undefined) {
                            vm.existedInSalesForce(false);
                        } else {
                            vm.existedInSalesForce(true);
                            vm.data.opptyID(opptyOverview.opptyID);
                            vm.data.opptyName(opptyOverview.opptyName);

                            vm.data.salesStage(opptyOverview.salesStage.substr(0, 2));
                            vm.data.opptyType(opptyOverview.opptyType);
                            vm.data.dealStatus(opptyOverview.dealStatus);
                            vm.data.clientName(opptyOverview.clientName);

                            var tcv = opptyOverview.opptyTcv.replace("$", "");
                            if (tcv != "") {
                                vm.data.opptyTcv(Math.floor(parseFloat(tcv.split(",").join(""))));
                            }

                            var fyr = opptyOverview.opptyFyr.replace("$", "");
                            if (fyr != "") {
                                vm.data.opptyFyr(Math.floor(parseFloat(fyr.split(",").join(""))));
                            }

                            //if (opptyOverview.leadBizUnit == "Enterprise Security Products") {
                            //	vm.data.leadBizUnit("ess");
                            //} else if (opptyOverview.leadBizUnit == "ITO GBU") {
                            //	vm.data.leadBizUnit("ito");
                            //} else {
                            //	//default leadBU value;
                            //	vm.data.leadBizUnit("ito");
                            //}

                            vm.data.contractTerm(opptyOverview.contractTerm);
                            vm.data.contractSignDate((appUtility.transformIOSDateToen(opptyOverview.contractSignDate)));
                            //vm.data.leadCntry(opptyOverview.leadCntry);
                            $("#sd-leadCntry option[label='" + opptyOverview.leadCntry + "']").attr("selected", true);
                            vm.data.leadCntry($("#sd-leadCntry option[label='" + opptyOverview.leadCntry + "']").attr("value"));
                            //vm.data.clientCntry(opptyOverview.clientCntry);
                            $("#sd-clientCntry option[label='" + opptyOverview.clientCntry + "']").attr("selected", true);
                            vm.data.clientCntry($("#sd-clientCntry option[label='" + opptyOverview.clientCntry + "']").attr("value"));
                            vm.data.leadRegion(opptyOverview.region);
                            var apps = opptyOverview.apps.replace("$", "");
                            if (apps !== "") {
                                var appsTcv = Math.floor(parseFloat(apps.split(",").join("")));
                                if (appsTcv > 0) {
                                    vm.data.involvedGbu.apps().inScope(true);
                                    vm.data.involvedGbu.apps().tcv(appsTcv);
                                }
                            }

                            var bps = opptyOverview.bps.replace("$", "");
                            if (bps !== "") {
                                var bpsTcv = Math.floor(parseFloat(bps.split(",").join("")));
                                if (bpsTcv > 0) {
                                    vm.data.involvedGbu.bps().inScope(true);
                                    vm.data.involvedGbu.bps().tcv(bpsTcv);
                                }
                            }

                            var ito = opptyOverview.ito.replace("$", "");
                            if (ito !== "") {
                                var itoTcv = Math.floor(parseFloat(ito.split(",").join("")));
                                if (itoTcv > 0) {
                                    vm.data.involvedGbu.ito().inScope(true);
                                    vm.data.involvedGbu.ito().tcv(itoTcv);
                                }
                            }

                            initNumBox();
                        }
                    });
                } else {
                    if (vm.isNewOppty()) {
                        vm.existedInSystem(true);
                    }
                }
            });
        }
    }

    function opptyData() {
        var data =  {
            opptyID: ko.observable(),
            opptyName: ko.observable(),
            salesStage: ko.observable(),
            opptyType: ko.observable(),
            dealStatus: ko.observable(),
            clientName: ko.observable(),
            opptyTcv: ko.observable(0),
            opptyFyr: ko.observable(0),
            leadBizUnit: ko.observable("ito"),
            involvedGbu: {
                apps: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                bps: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                ess: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                ito: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                hpeOther: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                hpi: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                })
            },
            contractTerm: ko.observable(0),
            contractSignDate: ko.observable(),
            contractStartDate: ko.observable(),
            pursuitClassfication: ko.observable(),
            solnGovTrack: ko.observable(),
            leadCntry: ko.observable(),
            leadRegion: ko.observable(),
            region: {
                ams: ko.observable(
                {
                    inScope: ko.observable(false)
                }),
                apj: ko.observable(
                {
                    inScope: ko.observable(false)
                }),
                emea: ko.observable(
                {
                    inScope: ko.observable(false)
                })
            },
            clientCntry: ko.observable(),
            pursuitWeb: {
                title: ko.observable(""),
                link: ko.observable(""),
            }
        };

        //define subscribes;
        data.leadCntry.subscribe(updateLeadRegion);
        data.leadRegion.subscribe(updateRegion);
        data.pursuitClassfication.subscribe(function (newValue) {
            if (newValue != "") {
                sectionLoaderViewModel.pursuitClassfication(newValue);
                //update section navigator
                sectionLoaderViewModel.sectionNavigator(requestAPI.createSectionModel(
                    newValue,
                    sectionLoaderViewModel.involvedGbu(),
                    sectionLoaderViewModel.appsInscope()
                ));
            }
        });

        data.involvedGbu.apps().inScope.subscribe(function (inScope) {
            updateInvolvedGbu(inScope, "apps");
            sectionLoaderViewModel.involvedGbu("apps");
            sectionLoaderViewModel.appsInscope(inScope);
            //update section navigator
            sectionLoaderViewModel.sectionNavigator(requestAPI.createSectionModel(
                sectionLoaderViewModel.pursuitClassfication(),
                "apps",
                inScope
            ));
        });
        data.involvedGbu.bps().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "bps") });
        data.involvedGbu.ito().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "ito") });
        data.involvedGbu.ess().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "ess") });
        data.involvedGbu.hpeOther().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "hpeOther") });
        data.involvedGbu.hpi().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "hpi") });

        data.region.apj().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "apj") });
        data.region.ams().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "ams") });
        data.region.emea().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "emea") });

        return data;
    }
	
    function cleanBindings() {
        vm.data.opptyName("");
        vm.data.salesStage("");
        vm.data.opptyType("");
        vm.data.dealStatus("");
        vm.data.clientName("");
        vm.data.opptyTcv(0);
        vm.data.opptyFyr(0);
        vm.data.leadBizUnit("ito");
        vm.data.involvedGbu.apps().tcv(0);
        vm.data.involvedGbu.apps().fyr(0);
        vm.data.involvedGbu.apps().inScope(false);
        vm.data.involvedGbu.bps().tcv(0);
        vm.data.involvedGbu.bps().fyr(0);
        vm.data.involvedGbu.bps().inScope(false);
        vm.data.involvedGbu.ito().tcv(0);
        vm.data.involvedGbu.ito().fyr(0);
        vm.data.involvedGbu.ito().inScope(false);
        vm.data.involvedGbu.ess().tcv(0);
        vm.data.involvedGbu.ess().fyr(0);
        vm.data.involvedGbu.ess().inScope(false);
        vm.data.involvedGbu.hpeOther().tcv(0);
        vm.data.involvedGbu.hpeOther().fyr(0);
        vm.data.involvedGbu.hpeOther().inScope(false);
        vm.data.involvedGbu.hpi().tcv(0);
        vm.data.involvedGbu.hpi().fyr(0);
        vm.data.involvedGbu.hpi().inScope(false);
        vm.data.contractTerm(0);
        vm.data.contractSignDate("");
        vm.data.contractStartDate("");
        vm.data.pursuitClassfication("");
        vm.data.solnGovTrack("");
        vm.data.leadCntry("NA");
        vm.data.region.ams().inScope(false);
        vm.data.region.apj().inScope(false);
        vm.data.region.emea().inScope(false);

        vm.data.leadRegion("NA");

        vm.data.clientCntry("NA");
        vm.data.pursuitWeb.title("");
        vm.data.pursuitWeb.link("");

        initNumBox();
    }
      
    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var opptyViewModel = function (json) {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "opportunity-data",
            };
            //define observables
            self.isNewOppty = ko.observable(false);
            self.existedInSystem = ko.observable(false);
            self.existedInSalesForce = ko.observable(true);
            self.contractSignDateString = "";
            self.data = new opptyData();

            self.editable = ko.observable(true);
            //define subscriptions
            self.inputOpptyId = ko.observable();
            self.inputOpptyId.subscribe(checkOpptyId);
            self.leadCntryName = ko.observable();
            self.clientCntryName = ko.observable();
            self.salesStageName = ko.observable();

            self.validId = ko.observable();
            //define functions
            self.loadGrip = function () {
                checkOpptyId();
            }
        }

        vm = new opptyViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function validateTcvAndFyr(vm) {
        //if type tcv value is empty string,we replace it with number 0;
        if (vm.data.opptyTcv() === "") {
            vm.data.opptyTcv(0);
        }
        if (vm.data.opptyFyr() === "") {
            vm.data.opptyFyr(0);
        }
        var gbu = ko.toJS(vm.data.involvedGbu);
        for (var unit in gbu) {
            if (gbu[unit].tcv === "") {
                vm.data.involvedGbu[unit]().tcv(0);
            }
            if (gbu[unit].fyr === "") {
                vm.data.involvedGbu[unit]().fyr(0);
            }
        }
    }

    function checkOpptyId(inputOpptyId) {
        //clean bindings and check input oppty id;
        cleanBindings();
        if (inputOpptyId != "" && checkIdFormat(inputOpptyId)) {
            vm.validId(true);
            loadGripData(inputOpptyId);
        } else {
            vm.validId(false);
        }
    }

    function checkIdFormat(opptyId) {
        // opportunity format should be OPP-1234567890 or OPE-1234567890
        var regx = /^OP[PE]-\d{10}$/;
        var rs = regx.test(opptyId);
        if (regx.test(opptyId)) {
            return true;
        } else {
            alert("Please check the opportunity format");
            return false;
        }
    }

    function checkRequiredField() {
        // check the required fields
        if (vm.isNewOppty()) {
            vm.data.opptyID(vm.inputOpptyId());
        }
        if (vm.data.opptyID() !== "" && vm.data.salesStage() !== "" && vm.data.clientName() !== "" && vm.data.opptyType() !== "" && vm.data.pursuitClassfication() !== "NA" && (vm.data.region.ams().inScope() || vm.data.region.apj().inScope() || vm.data.region.emea().inScope())) {
            return true;
        } else {
            alert("Please check the required fields");
            return false;
        }
    }

    function compareFryAndTcv() {
        //ensure that TCV is larger than FYR
        validateTcvAndFyr(vm);
        var isValid = true;
        var gbu = ko.toJS(vm.data.involvedGbu);
        if (parseInt(vm.data.opptyTcv()) < parseInt(vm.data.opptyFyr())) {
            isValid = false;
        }
        for (var unit in gbu) {
            if (parseInt(gbu[unit].tcv) < parseInt(gbu[unit].fyr)) {
                isValid = false;
                break;
            }
        }
        if (!isValid) {
            alert("Please ensure that TCV is larger than FYR !");
        }
        initNumBox();
        return isValid;
    }

    function verifyOpptyTcvAndOpptyFyr(vm) {
        //The Opportunity TCV should be equal to the combined total of all GBU TCV. 
        //The Opportunity FYR should be equal to the combined total of all GBU FYR.
        var gbu = ko.toJS(vm.data.involvedGbu);
        var opptyTcv = 0;  
        var opptyFyr = 0;
        if (vm.data.opptyTcv() !== "") {
            opptyTcv = parseInt(vm.data.opptyTcv());
        }
        if (vm.data.opptyFyr() !== "") {
            opptyFyr = parseInt(vm.data.opptyFyr());
        }
        
        for (var unit in gbu) {
            if (gbu[unit].tcv !== "") {
                opptyTcv -= parseInt(gbu[unit].tcv);
            }
            if (gbu[unit].fyr !== "") {
                opptyFyr -= parseInt(gbu[unit].fyr);
            }
        }
        if (opptyTcv === 0 && opptyFyr === 0) {
            return true;
        } else {
            return false;
        }
    }

    function checkContractDate() {
        // ensure that Contract sign date must be before or equal to contract start date;
        if (vm.data.contractSignDate() !== "" && vm.data.contractStartDate() !== "" && vm.data.contractSignDate() !== undefined && vm.data.contractStartDate() !== undefined) {
            var signDate = new Date(vm.data.contractSignDate()).format("MMM d yyyy");
            var startDate = new Date(vm.data.contractStartDate()).format("MMM d yyyy");
            if (Date.parse(signDate) < Date.parse(startDate) || Date.parse(signDate) === Date.parse(startDate)) {
                return true;
            } else {
                alert("Contract sign date must be before or equal to contract start date !");
                return false;
            }
        } else if (vm.data.contractStartDate() === "" || vm.data.contractStartDate() === undefined) {
            return true;
        } else{
            alert("Contract sign date must be before or equal to contract start date !");
            return false;
        }
    }

	return {
		name: ["Section0201", "sd-section-0201"],
		template: templateHtml,
		viewModel: {
			createViewModel: createViewModel
		},
		subComponents: [dateTimePicker, inputText, dollarFormatter]
	};
});









/*global define, alert, location*/
define('component/Section0202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        peoplePicker = require('./PeoplePicker'),
        templateHtml = require("text!./Section0202Template.html"),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function onViewModelPreLoad() {
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
    }

    function contact(contact) {
        this.title = contact.title;
        this.name = contact.name;
        this.email = contact.email;
        this.sipAddress = contact.sipAddress;
        this.type = contact.type;
    }
    function mappingResult(data, isEmpty) {
        this.data = data;
        this.isEmpty = isEmpty;
    }
    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", updateContact);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }
    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            loadSection();
            //getContact();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data != undefined && data.opptyOverview != null && data.opptyOverview.contact != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data === undefined) {
            getContact();
        } else {
            var opptyOverview = data.opptyOverview;
            if (opptyOverview != null && opptyOverview.contact != null) {
                doDataBinding(data);
            } else {
                vm.pageInited(true);
                computeRegionOrder();
            }
        }
    }

    function region(name, title) {
        this.name = name;
        this.title = title;
    }

    function getContact() {
        if (vm.section.opptyID === "") {

        } else {
            requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                }
                else {
                    var opptyOverview = oppty.data.opptyOverview;
                    if (opptyOverview != null && opptyOverview.contact != null) {
                        vm.section.eTag = xhr.getResponseHeader('ETag');
                        doDataBinding(oppty.data);
                    } else {
                        vm.pageInited(true);
                        computeRegionOrder();
                    }
                }
            });
        }
    }

    function doDataBinding(data) {
        computeRegionOrder();
        var contact = data.opptyOverview.contact.data;
        var coreTeam = contact.coreTeam;
        for (var role in coreTeam) {
            for (var region in coreTeam[role]) {
                if (coreTeam[role][region] != null) {
                    vm.data.coreTeam[role][region](coreTeam[role][region]);
                }
            }
        }
        var extendTeam = contact.extendTeam;
        for (var role in extendTeam) {
            for (var region in extendTeam[role]) {
                if (region == "dueDiligenceLead") {
                    if (extendTeam[role][region] != null) {
                        vm.data.extendTeam[role][region](extendTeam[role][region]);
                    }
                } else {
                    if (extendTeam[role][region] != null) {
                        vm.data.extendTeam[role][region](extendTeam[role][region]);
                    }
                }
            }
        }
        vm.pageInited(true);
    }

    function computeRegionOrder() {
        //var oppty = data.opptyOverview.opptyData.data;
        var data = sectionLoaderViewModel.document();
        if (data === undefined) {
            return;
        }
        var tempOppty = data.opptyOverview.opptyData.data;
        var involvedRegion = tempOppty.region;
        var index = 1;
        if (tempOppty.leadRegion !== "NA") {
            vm.leadRegion(new region(tempOppty.leadRegion, tempOppty.leadRegion.toUpperCase()));
            for (var re in involvedRegion) {
                if (re == vm.leadRegion().name) {
                    continue;
                }
                if (re != vm.leadRegion().name && involvedRegion[re].inScope) {
                    index = index + 1;
                    if (index == 2) {
                        vm.secondRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 3) {
                        vm.thirdRegion(new region(re, re.toUpperCase()));
                    }
                }
            }
        } else {
            for (var re in involvedRegion) {
                if (involvedRegion[re].inScope) {
                    index = index + 1;
                    if (index == 2) {
                        vm.leadRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 3) {
                        vm.secondRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 4) {
                        vm.thirdRegion(new region(re, re.toUpperCase()));
                    }
                }
            }
        }
    }

    function updateContact(event, argu) {
        var sid = argu.sid();
        if (sid !== '0202') {
            return;
        }
        if (!vm.pageInited()) {
            console.log("page has not been inited !");
            return;
        }

        var saveFunc = function () {
            if (($(".sp-peoplepicker-waitImg:visible").length > 0)) {
                setTimeout(saveFunc, 250);
            } else {
                var mappingResult = doDataMapping();
                if (!mappingResult.isEmpty) {
                    requestAPI.unifiedSave(true, mappingResult.data, argu);
                } else {
                    alert("Fill in one contact at least!");
                }
            }
        }
        setTimeout(saveFunc, 250);
    }

    function doDataMapping() {
        var emptyContact = true;
        var contacts = ko.toJS(vm.data);
        var coreTeam = contacts.coreTeam;
        for (var role in coreTeam) {
            for (var region in coreTeam[role]) {
                if (coreTeam[role][region] != undefined && coreTeam[role][region].length != 0 && coreTeam[role][region][0] != undefined) {
                    emptyContact = false;
                    var c = new contact(coreTeam[role][region][0]);
                    contacts.coreTeam[role][region] = c;
                } else {
                    if (contacts.coreTeam[role][region] === undefined) {
                        contacts.coreTeam[role][region] = null;
                    } else {
                        if (coreTeam[role][region] !== null && coreTeam[role][region].length === 0) {
                            contacts.coreTeam[role][region] = null;
                        } else {
                            emptyContact = false;
                        }
                    }
                }
            }
        }
        var extendTeam = contacts.extendTeam;
        for (var role in extendTeam) {
            for (var region in extendTeam[role]) {
                if (region == "dueDiligenceLead") {
                    if (extendTeam[role][region] != undefined && extendTeam[role][region].length != 0 && extendTeam[role][region][0] != undefined) {
                        emptyContact = false;
                        var c = new contact(extendTeam[role][region][0]);
                        contacts.extendTeam[role][region] = c;
                    } else {
                        if (contacts.extendTeam[role][region] === undefined) {
                            contacts.extendTeam[role][region] = null;
                        } else {
                            if (extendTeam[role][region] !== null && extendTeam[role][region].length === 0) {
                                contacts.extendTeam[role][region] = null;
                            } else {
                                emptyContact = false;
                            }
                        }
                    }
                } else {
                    if (extendTeam[role][region].length > 0) {
                        emptyContact = false;
                        contacts.extendTeam[role][region] = extendTeam[role][region];
                    }
                }
            }
        }
        return new mappingResult(contacts, emptyContact);
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var contactViewModel = function (params) {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "contacts"
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.data = {
                coreTeam: {
                    primary: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, ams: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, apj: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, emea: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }
                }, extendTeam: {
                    primary: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, ams: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, apj: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, emea: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }
                }
            }
            self.roleCollection = [
                "Account Executive",
                "Bid Manager",
                "Deal Analyst",
                "Delivery Owner",
                "HR Lead",
                "Legal/Contract Management Lead",
                "Opportunity Consultant",
                "Proposal Manager",
                "Pursuit Engagement Manager",
                "Sales Executive",
                "Solution Consultant",
                "Solution Lead",
                "Strategic Pursuit Lead",
                "T&T Leader"
            ];

            self.extendRoleCollection = [
                "Deal Intake (multiple rows/names)",
                "Due Diligence Leader",
                "Other Internal Business Partners (multiple rows/names)",
                "Practice Architects (multiple rows/names)",
                "Proposal Support (multiple rows/names)"
            ];

            self.involvedRegion = ko.observableArray();
            self.leadRegion = ko.observable();
            self.secondRegion = ko.observable();
            self.thirdRegion = ko.observable();

            self.opptyItem = ko.observable();

            self.pageInited = ko.observable(false);
            self.peoplePickerInited = ko.observable(true);

            self.save = function save(viewModel) {
                $(window).trigger("opptySaving", self);
            };
        };
        vm = new contactViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["Section0202", "sd-section-0202"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [peoplePicker]
    };

});
/*global define, alert, console, location*/
define('component/Section0301', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        questionArea = require("./QuestionArea"),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section0301Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function ClientOverview(data) {
        if (data != undefined && data != null) {
            this.clientRevenue = setEscapeValue(data.clientRevenue());            
            this.explainImpact = setEscapeValue(data.explainImpact());
            this.priBizChlgDetail = setEscapeValue(data.priBizChlgDetail());
            this.clientCompellingEventDetail = setEscapeValue(data.clientCompellingEventDetail());
            this.curItStateDetail = setEscapeValue(data.curItStateDetail());
            this.keyDifferentiation = setEscapeValue(data.keyDifferentiation());
            this.buRelationDetail = setEscapeValue(data.buRelationDetail());
            this.hpiRelationDetail = setEscapeValue(data.hpiRelationDetail());
            this.clientFcnDetail = setEscapeValue(data.clientFcnDetail());
            this.clientDecisionCriteriaDetail = setEscapeValue(data.clientDecisionCriteriaDetail());
            this.clientProcApproach = data.clientProcApproach();
            this.accountDeliveryMgmtDetail = setEscapeValue(data.accountDeliveryMgmtDetail());
        }
    }

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function unescapeData(data) {       
        vm.data.clientRevenue(getUnEscapeValue(data.clientRevenue));
        vm.data.explainImpact(getUnEscapeValue(data.explainImpact));
        vm.data.priBizChlgDetail(getUnEscapeValue(data.priBizChlgDetail));
        vm.data.clientCompellingEventDetail(getUnEscapeValue(data.clientCompellingEventDetail));
        vm.data.curItStateDetail(getUnEscapeValue(data.curItStateDetail));
        vm.data.keyDifferentiation(getUnEscapeValue(data.keyDifferentiation));
        vm.data.buRelationDetail(getUnEscapeValue(data.buRelationDetail));
        vm.data.hpiRelationDetail(getUnEscapeValue(data.hpiRelationDetail));
        vm.data.clientFcnDetail(getUnEscapeValue(data.clientFcnDetail));
        vm.data.clientDecisionCriteriaDetail(getUnEscapeValue(data.clientDecisionCriteriaDetail));
        vm.data.clientProcApproach(data.clientProcApproach);
        vm.data.accountDeliveryMgmtDetail(getUnEscapeValue(data.accountDeliveryMgmtDetail));
    }

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();        
    }

    function onViewModelLoaded(viewModel) {
        
    }

    function extractCntry(codeArray) {
        var extractCnties = [];
        for (var i in codeArray) {
            extractCnties.push(codeArray[i].text);
        }
        return extractCnties;
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;

        var clientOverViewModel = function () {
            var self = this;
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);

            self.draftData = ko.observable();//prepare for comparision
            
            self.data = {
                clientRevenue : ko.observable(""),
                explainImpact: ko.observable(""),
                priBizChlgDetail : ko.observable(""),
                clientCompellingEventDetail : ko.observable(""),
                curItStateDetail : ko.observable(""),
                keyDifferentiation : ko.observable(""),
                buRelationDetail: ko.observable(""),
                hpiRelationDetail: ko.observable(""),
                clientFcnDetail: ko.observable(""),
                clientDecisionCriteriaDetail : ko.observable(""),
                clientProcApproach : ko.observable(),
                accountDeliveryMgmtDetail : ko.observable("")  
            };         
        };
        vm = new clientOverViewModel(params);        
        loadSection();
        onViewModelLoaded(vm);
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        
        vm.pursuitClassfication(sectionLoaderViewModel.pursuitClassfication());
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.clientOverview != null) {
            unescapeData(doc.bizSoln.clientOverview.data);
            vm.draftData(doc.bizSoln.clientOverview.data);
        }
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0301') {
            return;
        }
        var newData = new ClientOverview(vm.data);
        requestAPI.unifiedSave(true, newData, argu);
        //if (JSON.stringify(newData) === JSON.stringify(ko.toJS(vm.draftData))) {
            //alert("Nothing Changed!");
        //} else {
            //compare their properties
            //if (appUtility.compareJson(newData, ko.toJS(vm.draftData)) === false) {
                /**
                 * submitFlag: true
                 * obj: newData,
                 * argu: viewModel
                 * }                 
                 */
                //requestAPI.unifiedSave(true, newData, argu);
            //} else {
                //alert("Nothing Changed!");
            //}
        //}        
    }

    return {
        name: ["Section0301", "sd-section-0301"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [questionArea]
    };

});
define('component/Section030201', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030201Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    //Construct object
    function SalesApproach(data) {
        if (data != undefined && data != null) {
            this.salesStrategyDetail = setEscapeValue(data.salesStrategyDetail());
            this.clientTransformationStrategyDetail = setEscapeValue(data.clientTransformationStrategyDetail());
            this.dealBenefitDetail = setEscapeValue(data.dealBenefitDetail());
            this.criticalSuccessFactorDetail = setEscapeValue(data.criticalSuccessFactorDetail());
            this.dealEssentialDetail = setEscapeValue(data.dealEssentialDetail());
            this.sumryRelationStrategyDetail = setEscapeValue(data.sumryRelationStrategyDetail());
            this.specificSolnRqmtDetail = setEscapeValue(data.specificSolnRqmtDetail());
            this.supporterDetractorDetail = setEscapeValue(data.supporterDetractorDetail());
            this.bizPartnerDetail = setEscapeValue(data.bizPartnerDetail());
        }
    }

    function setEscapeValue(val) {
        return val === undefined ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }
    
    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }


    function onViewModelLoaded() {
    }

    function unescapeData(data) {
        vm.data.salesStrategyDetail(getUnEscapeValue(data.salesStrategyDetail));
        vm.data.clientTransformationStrategyDetail(getUnEscapeValue(data.clientTransformationStrategyDetail));
        vm.data.dealBenefitDetail(getUnEscapeValue(data.dealBenefitDetail));
        vm.data.criticalSuccessFactorDetail(getUnEscapeValue(data.criticalSuccessFactorDetail));
        vm.data.dealEssentialDetail(getUnEscapeValue(data.dealEssentialDetail));
        vm.data.sumryRelationStrategyDetail(getUnEscapeValue(data.sumryRelationStrategyDetail));
        vm.data.specificSolnRqmtDetail(getUnEscapeValue(data.specificSolnRqmtDetail));
        vm.data.supporterDetractorDetail(getUnEscapeValue(data.supporterDetractorDetail));
        vm.data.bizPartnerDetail(getUnEscapeValue(data.bizPartnerDetail));
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var salesApprViewModel = function (json) {
            var self = this;
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                salesStrategyDetail : ko.observable(""),
                clientTransformationStrategyDetail : ko.observable(""),
                dealBenefitDetail : ko.observable(""),
                criticalSuccessFactorDetail : ko.observable(""),
                dealEssentialDetail : ko.observable(),
                sumryRelationStrategyDetail : ko.observable(""),
                specificSolnRqmtDetail : ko.observable(""),
                supporterDetractorDetail : ko.observable(""),
                bizPartnerDetail : ko.observable("")
            };
        }
        vm = new salesApprViewModel(params);
        loadSection();
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.pursuitClassfication(sectionLoaderViewModel.pursuitClassfication());
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.salesApproach != null)
            unescapeData(doc.bizSoln.winStrategy.salesApproach.data);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030201') {
            return;
        }
        var newData = new SalesApproach(vm.data);
        requestAPI.unifiedSave(true, newData, argu);
    }


    return {
        name: ["Section030201", "sd-section-030201"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        }
    };
   
});

define('component/Section030202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030202Template.html"),
        vm = {},
        sectionLoaderViewModel = {};
    
    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('show');
        listenCustomEvent();
    }

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function KeyCompetitor(data) {
        if (data != null) {
            this.name = data.name;
            this.strengthDetail = setEscapeValue(data.strengthDetail);
            this.weaknessDetail = setEscapeValue(data.weaknessDetail);
            this.advantageDetail = setEscapeValue(data.advantageDetail)
        }
    }

    function unescapeData(data) {
        vm.data.competitorNum(data.competitorNum);
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                vm.data.content[i].name(data.content[i].name);
                vm.data.content[i].strengthDetail(getUnEscapeValue(data.content[i].strengthDetail));
                vm.data.content[i].weaknessDetail(getUnEscapeValue(data.content[i].weaknessDetail));
                vm.data.content[i].advantageDetail(getUnEscapeValue(data.content[i].advantageDetail));
            }
        }
    }

    function initKeyCompetitor(num) {
        for (var i = 0; i < num, i < 4; i++) {
            vm.data.content.push(new KeyCompetitor());
        }        
    }

    function onViewModelLoaded() {
        
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var competitorsViewModel = function () {
            var self = this;
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                competitorNum : ko.observable(1),
                content: [
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail:ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    }
                ]
            };

            //subscrbe
            self.data.competitorNum.subscribe(checkNum);
            
        };
        vm = new competitorsViewModel(params);
        loadSection();
        return vm;
    }

    function checkNum(inputText) {
        var reg = /^\+?(0|[1-9]\d*)$/;
        if (reg.test(inputText)) {
            return true;
        }
        alert("Please enter a positive integer.");
        vm.data.competitorNum(1);
        return false;        
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.competitors != null)
            unescapeData(doc.bizSoln.winStrategy.competitors.data);
        
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030202') {
            return;
        } else {
            if (checkNum(vm.data.competitorNum())) {
                var newData = ko.toJS(vm.data);
                for (var i in newData.content) {
                    newData.content[i] = new KeyCompetitor(newData.content[i]);
                }
                requestAPI.unifiedSave(true, newData, argu);
            }
        }        
    }

    return {
        name: ["Section030202", "sd-section-030202"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        }
    };
   
});

define('component/Section030203', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030203Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function MapValProp(data) {
        if (data != null) {
            this.clientBizDetail = data.clientBizDetail;
            this.chlgImpactDetail = setEscapeValue(data.chlgImpactDetail);
            this.capabilityDetail = setEscapeValue(data.capabilityDetail);
            this.evidenceDetail = setEscapeValue(data.evidenceDetail);
        } else {
            this.clientBizDetail = "";
            this.chlgImpactDetail = "";
            this.capabilityDetail = "";
            this.evidenceDetail = "";
        }
    }

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }
       
    function unescapeData(data) {
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].clientBizDetail = getUnEscapeValue(data.content[i].clientBizDetail);
                data.content[i].chlgImpactDetail = getUnEscapeValue(data.content[i].chlgImpactDetail);
                data.content[i].capabilityDetail = getUnEscapeValue(data.content[i].capabilityDetail);
                data.content[i].evidenceDetail = getUnEscapeValue(data.content[i].evidenceDetail);
            } 
        } else {
            data.content.push(new MapValProp(null));
        }        
        vm.data.content(data.content);
    }

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
        listenCustomEvent();
    }

    function onViewModelLoaded() {
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var mapValPropViewModel = function () {
            var self = this;
            self.data = {
                content : ko.observableArray()
            };
            self.editable = ko.observable(true);
            self.addRow = function () {
                self.data.content.push(new MapValProp());
            };
            self.remove = function () {
                self.data.content.remove(this);
            }  
        };
        vm = new mapValPropViewModel(params);
        loadSection();
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.mapValProps != null) {
            unescapeData(doc.bizSoln.winStrategy.mapValProps.data);
        }            
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030203') {
            return;
        } else {
            var newData = ko.toJS(vm.data);
            for (var i in newData.content) {
                newData.content[i] = new MapValProp(newData.content[i]);
            }
            requestAPI.unifiedSave(true, newData, argu);
        }       
    }

    return {
        name: ["Section030203", "sd-section-030203"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        }
    };
   
});

define('component/Section030204', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030204Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function PricingApproach(data) {
        if (data != null) {
            if (data.yellowPadPricePercentage() == undefined || data.yellowPadPricePercentage() == null || data.yellowPadPricePercentage() == "")
                data.yellowPadPricePercentage(0);
            this.isYellowPadPrice = data.isYellowPadPrice() == 1 ? true : false;
            this.yellowPadPricePercentage= data.yellowPadPricePercentage() * vm.lowOrHigher();
            this.clientPriceExpectDetail = setEscapeValue(data.clientPriceExpectDetail());
            this.clientPriceStrategyDetail = setEscapeValue(data.clientPriceStrategyDetail());
            this.cmpyPriceStrategyDetail = setEscapeValue(data.cmpyPriceStrategyDetail());
            this.competitorPriceStrategyDetail = setEscapeValue(data.competitorPriceStrategyDetail());
            this.majorFinancialIssue = setEscapeValue(data.majorFinancialIssue());
        }
    }

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function unescapeData(data) {
        if (data.yellowPadPricePercentage <= 0) {
            vm.lowOrHigher(-1);
        } else {
            vm.lowOrHigher(1);
        }
        vm.data.isYellowPadPrice(data.isYellowPadPrice);
        vm.data.yellowPadPricePercentage(Math.abs(data.yellowPadPricePercentage));
        vm.data.clientPriceExpectDetail(getUnEscapeValue(data.clientPriceExpectDetail));
        vm.data.clientPriceStrategyDetail(getUnEscapeValue(data.clientPriceStrategyDetail));
        vm.data.cmpyPriceStrategyDetail(getUnEscapeValue(data.cmpyPriceStrategyDetail));
        vm.data.competitorPriceStrategyDetail(getUnEscapeValue(data.competitorPriceStrategyDetail));
        vm.data.majorFinancialIssue(getUnEscapeValue(data.majorFinancialIssue));
    }

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
        listenCustomEvent();
    }

    function onViewModelLoaded() {
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var pricingApproachViewModel = function () {
            var self = this;
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                isYellowPadPrice : ko.observable(true),
                yellowPadPricePercentage : ko.observable(0),
                clientPriceExpectDetail : ko.observable(""),
                clientPriceStrategyDetail : ko.observable(""),
                cmpyPriceStrategyDetail : ko.observable(""),
                competitorPriceStrategyDetail : ko.observable(""),
                majorFinancialIssue : ko.observable("")
            };

            //subscribe
            self.data.yellowPadPricePercentage.subscribe(function (newValue) {
                if (isNaN(newValue)) {
                    alert("Please input is decimal");
                    self.data.yellowPadPricePercentage(0.0);
                }
                return;
            });
            //low or higher
            self.lowOrHigher = ko.observable(1);
        };
        vm = new pricingApproachViewModel(params);
        loadSection();
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.pursuitClassfication(sectionLoaderViewModel.pursuitClassfication());
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.pricingApproach != null)
            unescapeData(doc.bizSoln.winStrategy.pricingApproach.data);        
    }

    function isDecimal(str) {
        var reg = /^\d+\.\d+$/;
        return reg.test(str);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030204') {
            return;
        } else {
            var newData = new PricingApproach(vm.data);
            if (isNaN(newData.yellowPadPricePercentage)) {
                alert("Please input is decimal");
                return;
            }
            requestAPI.unifiedSave(true, newData, argu);
        }        
    }
    
    return {
        name: ["Section030204", "sd-section-030204"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
    };

});

/*global define, alert, console, location*/
define('component/Section040101', function (require) {
	"use strict";
	var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040101Template.html"),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        appUtility = require('util/AppUtility'),
        jquery_bootstrap = require('jquery_bootstrap'),
        vm = {},
        sectionLoaderViewModel = {};

	function listenCustomEvent() {
		$(window).off("opptySaving");
		$(window).on("opptySaving", saveOppty);
		$(window).off("updateSection");
		$(window).on("updateSection", function (e, newViewModel) {
		    loadSection(newViewModel);
		});
	}

	function onViewModelPreLoad() {
	    listenCustomEvent();
	    $.messager.model = {
	        ok: { text: "Delete",classed: "btn-default" },
	        cancel: { text: "Cancel", classed: "btn-error" }
	    };
	}

	function onViewModelLoaded() {
		vm.section.opptyID = sectionLoaderViewModel.opptyID();
		if (vm.editable()) {
		    loadSection();
		} else {
		    var data = sectionLoaderViewModel.document();
		    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
		        doDataBinding(data);
		    }
		}
	}

	function loadSection(latestedSectionLoaderViewModel) {
	    if (latestedSectionLoaderViewModel) {
	        sectionLoaderViewModel = latestedSectionLoaderViewModel;
	    }
	    var data = sectionLoaderViewModel.document();
	    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
	        doDataBinding(data);
	    } else {
	        //load productLines from saleforce if the opptyID exist in grip;
	        sp.app.workingDialog.show("Loading productLines from grip .");
	        opptyModel.getOpptyOverviewAsync(vm.section.opptyID).done(function (opptyOverview) {
	            sp.app.workingDialog.hide("Loading productLines from grip .");
	            if (opptyOverview == undefined) {
	            } else {
	                initOfferings(opptyOverview.productLine);
	            }
	        });
	    }
	}

	function offering(offering) {
	    this.offeringId = offering.offeringId;
		this.serviceLine = offering.serviceLine;
		this.offering = offering.offering;
		this.clientVolume = offering.clientVolume;
		this.nStdComponent = offering.nStdComponent;
	}

	function doDataBinding(data) {
		var content = data.solnOverview.scope.allOfferings.data.content;
		vm.section.data.content(unescapeContent(content));

		vm.pageInited(true);
	}

	function initOfferings(productLine) {
		var offering = [];
		for (var k in productLine) {
		    offering.push({ offeringId: appUtility.newGuid(), serviceLine: productLine[k].serviceLine, offering: productLine[k].offering, clientVolume: "", nStdComponent: "" });
		}
		vm.section.data.content(offering);
		vm.pageInited(true);
	}

	function saveOppty(event, argu) {
	    var sid = argu.sid();
	    if (sid !== '040101') {
	        return;
	    }
	    if (!vm.pageInited()) {
	        return;
	    }
	    var temp = escapeContent(ko.toJS(vm.section.data));
	    requestAPI.unifiedSave(true, temp, argu);
	}

	function escapeContent(data){
		for(var i in data.content){
			data.content[i].nStdComponent = escape(data.content[i].nStdComponent);
		}
		return data;
	}

	function unescapeContent(content){
		for(var i in content){
			content[i].nStdComponent = unescape(content[i].nStdComponent);
		}
		return content;
	}

	function createViewModel(params, componentInfo) {
		sectionLoaderViewModel = params.viewModel;
		onViewModelPreLoad();
		var offeringViewModel = function () {
			var self = this;
			self.section = {
				opptyID: "",
				eTag: "",
				name: "all-offerings",
				data: {
					content: ko.observable([]),
				}
			};
			self.editable = ko.observable(sectionLoaderViewModel.editable());
			self.pageInited = ko.observable(false);
			self.addRow = function () {
				var temp = self.section.data.content();
				temp.push({ offeringId:appUtility.newGuid(),serviceLine: "", offering: "", clientVolume: "", nStdComponent: ""});
				self.section.data.content(temp);
			};
			
			self.removeRow = function (index) {
			    var temp = self.section.data.content();
			    var offering = temp[index].offering;
			    $.messager.confirm("An item will be deleted", "<span class=text-warning><b>&nbsp;&nbsp;" + "If you click 'Delete' ,the offering which are cascaded from 'all-Offering' will be deleted meanwhile ! Are you sure to delete the offering '" + offering + "' ? " + "</b></span>", function () {
			        temp.splice(index, 1);
			        self.section.data.content(temp);
			    });
			};
		};
		vm = new offeringViewModel(params);
		onViewModelLoaded();
		return vm;
	}

	return {
		name: ["Section040101", "sd-section-040101"],
		template: templateHtml,
		viewModel: {
			createViewModel: createViewModel
		}
	}
});
/*global define, alert, console, location*/
define('component/Section040102', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040102Template.html"),
        requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getKeyScopeItem();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.keyScopeItem != null) {
    	        doDataBinding(data);
            }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.keyScopeItem != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var keyScopeItem = unescapeContent(data.solnOverview.scope.keyScopeItem.data);
    	vm.section.data.keyScopeItemDetail(keyScopeItem.keyScopeItemDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040102') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var keyScopeItemViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "key-scope-items",
    			data: {
    				keyScopeItemDetail: ko.observable()
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new keyScopeItemViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040102", "sd-section-040102"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section0402', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0402Template.html"),
		requestAPI = require('model/RequestAPI'),
        attachmentManager = require('./AttachmentManager'),
        appUtility = require('util/AppUtility'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }
    function updateAttachments(data) {
        console.log(vm.section.data.attachment());
    }
    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            //getClientArch();
            loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.clientArch != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.clientArch != null) {
            doDataBinding(data);
        } else {
            //init attachment with empty array;
            vm.section.data.attachment([]);
        }
    }

    function doDataBinding(data) {
        var clientArch = unescapeContent(data.solnOverview.clientArch.data);
    	vm.section.data.keyComponentDetail(clientArch.keyComponentDetail);
    	vm.section.data.painAreaDetail(clientArch.painAreaDetail);
    	vm.section.data.keyTechDriverDetail(clientArch.keyTechDriverDetail);
    	vm.section.data.bizCriticalAreaDetail(clientArch.bizCriticalAreaDetail);
    	vm.section.data.serviceCollaborationDetail(clientArch.serviceCollaborationDetail);
    	vm.section.data.integrationNeedDetail(clientArch.integrationNeedDetail);
    	vm.section.data.archPrincipleDetail(clientArch.archPrincipleDetail);
    	vm.section.data.archPrincipleConflictDetail(clientArch.archPrincipleConflictDetail);
    	vm.section.data.attachment(clientArch.attachment);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0402') {
            return;
        }
        if (document.querySelector(".attachment-uploaing-warning").innerText !== "" && confirm("One or more files are being uploaded. Are you sure to save?") === false) {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
        content.keyComponentDetail = escape(content.keyComponentDetail);
        content.painAreaDetail = escape(content.painAreaDetail);
        content.keyTechDriverDetail = escape(content.keyTechDriverDetail);
        content.bizCriticalAreaDetail = escape(content.bizCriticalAreaDetail);
        content.serviceCollaborationDetail = escape(content.serviceCollaborationDetail);
        content.integrationNeedDetail = escape(content.integrationNeedDetail);
        content.archPrincipleDetail = escape(content.archPrincipleDetail);
        content.archPrincipleConflictDetail = escape(content.archPrincipleConflictDetail);
        for (var p in content.attachment) {
            content.attachment[p].link = escape(content.attachment[p].link);
        }
    	return content;
    }

    function unescapeContent(content) {
        content.keyComponentDetail = unescape(content.keyComponentDetail);
        content.painAreaDetail = unescape(content.painAreaDetail);
        content.keyTechDriverDetail = unescape(content.keyTechDriverDetail);
        content.bizCriticalAreaDetail = unescape(content.bizCriticalAreaDetail);
        content.serviceCollaborationDetail = unescape(content.serviceCollaborationDetail);
        content.integrationNeedDetail = unescape(content.integrationNeedDetail);
        content.archPrincipleDetail = unescape(content.archPrincipleDetail);
        content.archPrincipleConflictDetail = unescape(content.archPrincipleConflictDetail);
        if (content.attachment != null) {
            for (var p in content.attachment) {
                content.attachment[p].link = unescape(content.attachment[p].link);
            }
        } else {
            content.attachment = [];
        }
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var clientArchViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "client-architecture",//section name 
    			data: {
    				keyComponentDetail: ko.observable(),
    				painAreaDetail: ko.observable(),
    				keyTechDriverDetail: ko.observable(),
    				bizCriticalAreaDetail: ko.observable(),
    				serviceCollaborationDetail: ko.observable(),
    				integrationNeedDetail: ko.observable(),
    				archPrincipleDetail: ko.observable(),
    				archPrincipleConflictDetail: ko.observable(),
    				attachment: ko.observableArray()
    			},
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new clientArchViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0402", "sd-section-0402"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };
});
/*global define, alert, console, location*/
define('component/Section040301', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040301Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});

    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getSummary();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.summary != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.summary != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var summary = unescapeContent(data.solnOverview.solnApproach.summary.data);
    	vm.section.data.overviewDetail(summary.overviewDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040301') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var summaryViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "summary",//section name 
    			data: {
    				overviewDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new summaryViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040301", "sd-section-040301"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040302', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040302Template.html"),
		requestAPI = require('model/RequestAPI'),
        attachmentManager = require('./AttachmentManager'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getOutSourcing();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.xmo != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.xmo != null) {
            doDataBinding(data);
        } else {
            //init attachment with empty array;
            vm.section.data.attachment([]);
        }
    }

    function doDataBinding(data) {
        var xmo = unescapeContent(data.solnOverview.solnApproach.xmo.data);
        vm.section.data.attachment(xmo.attachment);
    	vm.section.data.cmoDetail(xmo.cmoDetail);
    	vm.section.data.tmoDetail(xmo.tmoDetail);
    	vm.section.data.fmoDetail(xmo.fmoDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040302') {
            return;
        }
        if (document.querySelector(".attachment-uploaing-warning").innerText !== "" && confirm("One or more files are being uploaded. Are you sure to save?") === false) {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }
    function escapeContent(content) {
		content.cmoDetail = escape(content.cmoDetail);
    	content.tmoDetail = escape(content.tmoDetail);
		content.fmoDetail = escape(content.fmoDetail);
		for (var p in content.attachment) {
			content.attachment[p].link = escape(content.attachment[p].link);
    	}
    	return content;
    }

    function unescapeContent(content) {
		content.cmoDetail = unescape(content.cmoDetail);
    	content.tmoDetail = unescape(content.tmoDetail);
    	content.fmoDetail = unescape(content.fmoDetail);
    	if (content.attachment != null) {
    	    for (var p in content.attachment) {
    	        content.attachment[p].link = unescape(content.attachment[p].link);
    	    }
    	} else {
    	    content.attachment = [];
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var outSourcingViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "xmo",//section name 
    			data: {
    				attachment: ko.observableArray([]),
    				cmoDetail: ko.observable(""),
    				tmoDetail: ko.observable(""),
    				fmoDetail: ko.observable(""),
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.attachmentSelected = function (e) {
    			insertAttachment(self);
    		};
    	};
    	vm = new outSourcingViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040302", "sd-section-040302"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };

});
/*global define, alert, console, location*/
define('component/Section040303', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040303Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function initHelpTooltip() {
        var options = {
            animation: true,
        };
        $('.sd-section-help').tooltip();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getHRSoln();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.hrSoln != null) {
    	        doDataBinding(data);
    	    }
    	}    
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();

        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.hrSoln != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function hrSoln(hrIssue, approach) {
        self.hrIssue = hrIssue;
        self.approach = approach;
    };

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.hrSoln.data.content));
    	var content = vm.section.data.content();
    	vm.hrSolutionContent(createOriginallHrsoln());
    	for (var i in content) {
    		if (i < vm.initIssueCount) {
    			vm.hrSolutionContent()[i].approach(content[i].approach);
    			vm.hrSolutionContent()[i].checked(content[i].inScope);
    		} else {
    			vm.hrSolutionContent.push(new hrSolnRow(content[i].hrIssue, content[i].hrIssueTitle, "",true, content[i].inScope, content[i].approach));
    		}
    	}
    	initHelpTooltip();
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040303') {
            return;
        }
        var content = [];
        for (var i in vm.hrSolutionContent()) {
        	if (vm.hrSolutionContent()[i].checked()) {
        		//if the line is checked, use the observable value .
        		content.push({ inScope: true, hrIssue: vm.hrSolutionContent()[i].hrIssue(), hrIssueTitle: vm.hrSolutionContent()[i].hrIssueTitle(), approach: escape(vm.hrSolutionContent()[i].approach()) });
        	} else {
        		content.push({ inScope: false, hrIssue: vm.hrSolutionContent()[i].hrIssue(), hrIssueTitle: vm.hrSolutionContent()[i].hrIssueTitle(), approach: "" });
        	}
        }
        vm.section.data.content(content);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].hrIssueTitle = escape(content[i].hrIssueTitle);
    		content[i].approach = escape(content[i].approach);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].hrIssueTitle = unescape(content[i].hrIssueTitle);
    		content[i].approach = unescape(content[i].approach);
    	}
    	return content;
    }

    function hrSolnRow(hrIssue, hrIssueTitle, hint, isOriginal, checked, approach) {
        this.hrIssue = ko.observable(hrIssue);
        this.hrIssueTitle = ko.observable(hrIssueTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.approach = ko.observable(approach);
    };

    function createOriginallHrsoln() {
        var hrSolnArray = [];
        hrSolnArray.push(new hrSolnRow("ClientEmployee", "Client's Employees", "Issues or risks related to the client's employees that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("ClientSubcontractor", "Client's Subcontractors", "Issues or risks related to the client's subcontractors that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("ClientContractor", "Client's Third Party Contractors", "Issues or risks related to the client's third parties that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("HPEmployee", "Existing HPE Employees (Renewals only)", "HPE plans for existing account support employees that could negatively or positively impact the HPE solution.", true, false, ''));
        return hrSolnArray;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var hrSolnViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "hr-solutions",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.hrSolutionContent = ko.observableArray(createOriginallHrsoln());
    		self.initIssueCount = self.hrSolutionContent().length;

    		self.addRow = function () {
    		    self.hrSolutionContent.push(new hrSolnRow("Other", "","", false, true, ""))
    		};
    	    
    		self.removeRow = function (index) {
    		    var temp = self.hrSolutionContent();
    		    temp.splice(index, 1);
    		    self.hrSolutionContent(temp);
    		};
    	};
    	vm = new hrSolnViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040303", "sd-section-040303"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040304', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040304Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function initHelpTooltip() {
        var options = {
            animation: true,
        };
        $('.sd-section-help').tooltip();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getCmpyChallenge();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.cmpyChallenge != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.cmpyChallenge != null) {
            doDataBinding(data);
        } else {
            self.isNewSection = true;
            // section is not existed
        }
    }

    function challengeRow(challenge, challengeTitle, hint,isOriginal, checked, description) {
        this.challenge = ko.observable(challenge);
        this.challengeTitle = ko.observable(challengeTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.description = ko.observable(description);
    };

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.cmpyChallenge.data.content));
    	var content = vm.section.data.content();

    	if (content[1].challenge === "Trade") {
    	    content.splice(1, 1);
    	}

    	vm.cmpyChallenge(createOriginalChallenge());
    	for (var i in content) {
    	    if (i < vm.initChallengeCount) {
    			vm.cmpyChallenge()[i].description(content[i].description);
    			vm.cmpyChallenge()[i].checked(content[i].inScope);
    		} else {
    		    if (content[i].challenge === "Other") {
    		        vm.cmpyChallenge.push(new challengeRow(content[i].challenge, content[i].challengeTitle, "", true, content[i].inScope, content[i].description));
    		    }
    		}
    	}
    	initHelpTooltip();
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040304') {
            return;
        }
    	var tempArrar = [];
        for (var i in vm.cmpyChallenge()) {
            if (vm.cmpyChallenge()[i].checked()) {
                //if the line is checked, use the observable value .
            	tempArrar.push({ inScope: true, challenge: escape(vm.cmpyChallenge()[i].challenge()),challengeTitle:vm.cmpyChallenge()[i].challengeTitle(), description: escape(vm.cmpyChallenge()[i].description()) });
            } else {
            	tempArrar.push({ inScope: false, challenge: escape(vm.cmpyChallenge()[i].challenge()), challengeTitle: vm.cmpyChallenge()[i].challengeTitle(), description: "" });
            }
        }

        vm.section.data.content(tempArrar);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].challengeTitle = escape(content[i].challengeTitle);
    		content[i].description = escape(content[i].description);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].challengeTitle = unescape(content[i].challengeTitle);
    		content[i].description = unescape(content[i].description);
    	}
    	return content;
    }

    function createOriginalChallenge() {
        var challengeArr = [];
        challengeArr.push(new challengeRow("Asset", "Asset ownership/refresh", "Issues or risks related to the client's requirements for asset ownership that could negatively or positively impact the HPE solution; i.e., long refresh schedules could impact SLAs.",true, false, ''));
       // challengeArr.push(new challengeRow("Trade", "Global Trade requirements", "", true, false, ''));
        challengeArr.push(new challengeRow("Initiative", "Internal initiatives that could impact deal", "Strategic initiative resource consumption, changes to delivery model, changes to offering or SLA standards", true, false, ''));
        challengeArr.push(new challengeRow("Knowledge", "Knowledge and supportability gaps", "Are special skill sets or training required? Will the solution require extended knowledge transfer with client resources? Is employee retention an issue?", true, false, ''));
        challengeArr.push(new challengeRow("Legal", "Legal issues related to solution", "Client commercial terms/requirements that could negatively impact or limit the solution, our costs or our ability to deliver.", true, false, ''));
        challengeArr.push(new challengeRow("Sourcing", "Location Sourcing limitations", "Client requirements that cause the solution to be non-compliant with HPE location sourcing requirements.", true, false, ''));
        challengeArr.push(new challengeRow("Staffing", "Staffing Issues", "Does HPE have the resource capacity necessary to deliver the solution? Will third party resources be required?", true, false, ''));
        return challengeArr;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var cmpyChallengeViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "company-challenges",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.cmpyChallenge = ko.observableArray(createOriginalChallenge());
    		self.initChallengeCount = self.cmpyChallenge().length;
    		self.addRow = function () {
    		    self.cmpyChallenge.push(new challengeRow("Other", "","", false, true, ''));
    		};

    		self.removeRow = function (index) {
    		    var temp = self.cmpyChallenge();
    		    temp.splice(index, 1);
    		    self.cmpyChallenge(temp);
    		};
    	};
    	vm = new cmpyChallengeViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040304", "sd-section-040304"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040305', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040305Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getDesignParam();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.designParam != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.designParam != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var designParam = unescapeContent(data.solnOverview.solnApproach.designParam.data);
    	vm.section.data.solnParamDetail(designParam.solnParamDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040305') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var designParamViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "design-params",//section name 
    			data: {
    				solnParamDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new designParamViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040305", "sd-section-040305"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040306', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040306Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getDeployStrategy();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.deployStrategy != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.deployStrategy != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var deployStrategy = unescapeContent(data.solnOverview.solnApproach.deployStrategy.data);
    	vm.section.data.initialThoughtDetail(deployStrategy.initialThoughtDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040306') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var deployStrategyViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "deploy-strategy",//section name 
    			data: {
    				initialThoughtDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new deployStrategyViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040306", "sd-section-040306"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040307', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040307Template.html"),
		requestAPI = require('model/RequestAPI'),
        attachmentManager = require('./AttachmentManager'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getAdditionalInfo();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.additionalInfo != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.additionalInfo != null) {
            doDataBinding(data);
        } else {
            //init attachment with empty array;
            vm.section.data.attachment([]);
        }
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var additionalInfoViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "additional-info",
            	data: {
            	    explainDetail: ko.observable(""),
            	    attachment: ko.observableArray()
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
        };
        vm = new additionalInfoViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function doDataBinding(data) {
    	var additionalInfo = unescapeContent(data.solnOverview.solnApproach.additionalInfo.data);
    	vm.section.data.explainDetail(additionalInfo.explainDetail);
    	vm.section.data.attachment(additionalInfo.attachment);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040307') {
            return;
        }
        if (document.querySelector(".attachment-uploaing-warning").innerText !== "" && confirm("One or more files are being uploaded. Are you sure to save?") === false) {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
        content.explainDetail = escape(content.explainDetail);
        for (var p in content.attachment) {
            content.attachment[p].link = escape(content.attachment[p].link);
        }
    	return content;
    }

    function unescapeContent(content) {
        content.explainDetail = unescape(content.explainDetail);
        if (content.attachment != null) {
            for (var p in content.attachment) {
                content.attachment[p].link = unescape(content.attachment[p].link);
            }
        } else {
            content.attachment = [];
        }
    	return content;
    }

    return {
        name: ["Section040307", "sd-section-040307"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };

});
/*global define, alert, console, location*/
define('component/Section0404', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0404Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getInnovativeAspect();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.innovativeAspect != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.innovativeAspect != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var innovativeAspect = unescapeContent(data.solnOverview.innovativeAspect.data);
    	vm.section.data.innovativeElementDetail(innovativeAspect.innovativeElementDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0404') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var innovativeAspectViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "innovative-aspects",
    			data: {
    				innovativeElementDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new innovativeAspectViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0404", "sd-section-0404"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});
/*global define, alert, console, location*/
define('component/Section040501', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040501Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.locationTarget != null) {
    	        if (data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.locationTarget != null) {
            doDataBinding(data);
        } else {
            // section is not existed
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var temp = [];
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, clientVolume: allOffering[k].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
                }
                vm.section.data.content(temp);
            }
            vm.pageInited(true);
        }
        return data;
    }

    function compareWithAllOffering(allOffering, locationTarget) {
        //compare allOfferings with  locationTarget in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in locationTarget;
            var loc = -1;
            $.each(locationTarget, function (targetIndex, target) {
                if (target.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed locationTarget into result ,
                     and end the query in locationTarget;
                     */
                    var temp = target;
                    temp.clientVolume = offering.clientVolume;
                    result.push(temp);
                    loc = targetIndex;
                    Array.removeAt(locationTarget, targetIndex);
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new locationTarget into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, clientVolume: offering.clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
            }
        });
        return result;
    }

    function doDataBinding(data) {
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var locationTarget = data.solnOverview.deliveryStrategies.locationTarget.data.content;
    	var result = compareWithAllOffering(allOffering, locationTarget)
    	vm.section.data.content(unescapeContent(result));
    	vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040501') {
            return;
        }
        if (!vm.pageInited()) {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(data) {
    	for (var i in data.content) {
    		data.content[i].comment = escape(data.content[i].comment);
    	}
    	return data;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].comment = unescape(content[i].comment);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var locationTargetViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "location-targets",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.pageInited = ko.observable(false);
    	};
    	vm = new locationTargetViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040501", "sd-section-040501"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040502', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040502Template.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return new viewModel(params);
    }

    return {
        name: ["Section040502", "sd-section-040502"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040503', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040503Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            //getsvcMgmt();
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcMgmt != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcMgmt != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
        var svcMgmt = unescapeContent(data.solnOverview.deliveryStrategies.svcMgmt.data);
        vm.section.data.svcMeasureDetail(svcMgmt.svcMeasureDetail);
        vm.section.data.supplierMgmtDetail(svcMgmt.supplierMgmtDetail);
        vm.section.data.perfMeasureDetail(svcMgmt.perfMeasureDetail);
        vm.section.data.catalogueStrategyDetail(svcMgmt.catalogueStrategyDetail);
        vm.section.data.toolingStrategyDetail(svcMgmt.toolingStrategyDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040503') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
        for (var p in content) {
            content[p] = escape(content[p]);
        }
        return content;
    }

    function unescapeContent(content) {
        for (var p in content) {
            content[p] = unescape(content[p]);
        }
        return content;
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var svcMgmtViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "service-management",
                data: {
                    svcMeasureDetail: ko.observable(""),
                    supplierMgmtDetail: ko.observable(""),
                    perfMeasureDetail: ko.observable(""),
                    catalogueStrategyDetail: ko.observable(""),
                    toolingStrategyDetail: ko.observable("")
                }
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
        };
        vm = new svcMgmtViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["Section040503", "sd-section-040503"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040504', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040504Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return new viewModel(params);
    }

    return {
        name: ["Section040504", "sd-section-040504"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040505', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
		select2 = require('select2'),
        templateHtml = require("text!./Section040505Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        //pop-up tooltip    
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcDeliveryResp != null) {
                if (data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                    doDataBinding(data);
                }
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcDeliveryResp != null) {
            doDataBinding(data);
        } else {
            vm.svcDeliveryResp([]);
            var temp = [];
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
                }
                vm.section.data.content(temp);
                for (var resp in temp) {
                    vm.svcDeliveryResp.push(new deliveryResp(temp[resp]));
                }
            }
            vm.pageInited(true);
        }
    }

    function deliveryResp(resp) {
        var me = this;
        me.offeringId = ko.observable(resp.offeringId);
        me.offering = ko.observable(resp.offering);
        me.delivery = ko.observable(resp.delivery);
        me.otherBuDelivery = ko.observable(resp.otherBuDelivery);
        me.specificBuDelivery = ko.observable(resp.specificBuDelivery);
        me.partnerDelivery = ko.observable(resp.partnerDelivery);
        me.thirdPartyDelivery = ko.observable(resp.thirdPartyDelivery);
        me.comment = ko.observable(resp.comment);

        me.index = vm.svcDeliveryResp().length;
        me.loaded = ko.observable(true);
        me.otherOptionVisible = ko.observable(false);
        update(me.otherBuDelivery());

        me.otherBuDelivery.subscribe(function (buDelivery) { me.updateSpecificBuDelivery(buDelivery); });
        me.updateSpecificBuDelivery = function (buDelivery) {
            me.loaded(false);
            update(buDelivery);
        }
        function update(buDelivery) {
            if (buDelivery == 'Other') {
                me.otherOptionVisible(true);
            } else {
                me.otherOptionVisible(false);
            }
        }
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var svcDeliveryRespViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "service-delivery-responsibilities",
                data: {
                    content: ko.observable([])
                }
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.pageInited = ko.observable(false);

            self.svcDeliveryResp = ko.observableArray([]);
        };
        vm = new svcDeliveryRespViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function compareWithAllOffering(allOffering, svcDeliveryResp) {
        //compare allOfferings with  svcDeliveryResp in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in svcDeliveryResp;
            var loc = -1;
            $.each(svcDeliveryResp, function (respIndex, resp) {
                if (resp.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed resp into result ,
                     and end the query in svcDeliveryResp;
                     */
                    result.push(resp);
                    loc = respIndex;
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new resp into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
            }
        });

        return result;
    }

    function doDataBinding(data) {
        vm.svcDeliveryResp([]);
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var svcDeliveryResp = unescapeContent(data.solnOverview.deliveryStrategies.svcDeliveryResp.data.content);
        var result = compareWithAllOffering(allOffering, svcDeliveryResp)

        vm.section.data.content(result);
        for (var resp in result) {
            vm.svcDeliveryResp.push(new deliveryResp(result[resp]));
        }

        vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040505') {
            return;
        }
        if (!vm.pageInited()) {
            return;
        }
        var temp = doDataMapping();
        requestAPI.unifiedSave(true, temp, argu);
    }

    function doDataMapping() {
        var svcDeliveryResp = [];
        for (var resp in vm.svcDeliveryResp()) {
            svcDeliveryResp.push({ offeringId: vm.svcDeliveryResp()[resp].offeringId(), offering: vm.svcDeliveryResp()[resp].offering(), delivery: vm.svcDeliveryResp()[resp].delivery(), otherBuDelivery: vm.svcDeliveryResp()[resp].otherBuDelivery(), specificBuDelivery: vm.svcDeliveryResp()[resp].specificBuDelivery(), partnerDelivery: vm.svcDeliveryResp()[resp].partnerDelivery(), thirdPartyDelivery: vm.svcDeliveryResp()[resp].thirdPartyDelivery(), comment: vm.svcDeliveryResp()[resp].comment() });
        }
        vm.section.data.content(svcDeliveryResp);
        return escapeContent(ko.toJS(vm.section.data));
    }

    function escapeContent(data) {
        for (var i in data.content) {
            data.content[i].comment = escape(data.content[i].comment);
        }
        return data;
    }

    function unescapeContent(content) {
        for (var i in content) {
            content[i].comment = unescape(content[i].comment);
        }
        return content;
    }

    return {
        name: ["Section040505", "sd-section-040505"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section040506', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040506Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function DeliveryResp(data) {
        if (data != null) {
            return {
                retainedService: data.retainedService,
                clientDelivery: data.clientDelivery == 1 ? true : false,
                clientPartnerDelivery: data.clientPartnerDelivery,
                clientThirdPartyDelivery: data.clientThirdPartyDelivery,
                comment:escape(data.comment)
            };
        }
        return {
            retainedService:"",
            clientDelivery: "",
            clientPartnerDelivery: "",
            clientThirdPartyDelivery: "",
            comment:""
        };
    }

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	//pop-up tooltip           
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            //getDeliveryResp();
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.clientRetainedResp != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.clientRetainedResp != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var clientRetainedRespViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "client-retained-responsibilities"
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.data = {
                content: ko.observableArray()
            };

            self.addRow = function () {
                self.data.content.push(new DeliveryResp());                
            };

            self.remove = function () {
                self.data.content.remove(this);
            };
        };
        vm = new clientRetainedRespViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        onViewModelLoaded(vm);
        return vm;
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040506') {
            return;
        }
    	var newDataArr = new Array;
    	for (var i in vm.data.content()) {
    	    newDataArr.push(new DeliveryResp(vm.data.content()[i]));
    	}
    	var temp = { "content": newDataArr };
    	requestAPI.unifiedSave(true, temp, argu);
    }

    function doDataBinding(data) {
        var clientRetainedResp = data.solnOverview.deliveryStrategies.clientRetainedResp.data.content;
        vm.data.content(unescapeData(clientRetainedResp));
    }

    function unescapeData(content) {
        for (var i in content) {            
    		content[i].comment = unescape(content[i].comment);
        }
        return content;
    }

    return {
        name: ["Section040506", "sd-section-040506"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section0406', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0406Template.html"),
        vm = {},
		requestAPI = require('model/RequestAPI'),
        sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function initHelpTooltip() {
        var options = {
            animation: true,
        };
        $('.sd-section-help').tooltip();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getConstraint();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.keyClientConstraint != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.keyClientConstraint != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.keyClientConstraint.data.content));
    	var content = vm.section.data.content();
    	vm.keyClientConstraint(createOriginalConstraint());
    	for (var i in content) {
    		//the number of original issues is 4 ,which equals the length of hrSolutionContent(before use '+ ' button to add rows)
    		if (i < vm.initConstraintCount) {
    			vm.keyClientConstraint()[i].checked(content[i].inScope);
    			vm.keyClientConstraint()[i].description(content[i].description);
    			vm.keyClientConstraint()[i].mitigation(content[i].mitigation);
    		} else {
    			vm.keyClientConstraint.push(new constraintRow(content[i].constraint, content[i].constraintTitle,"", true, content[i].inScope, content[i].description, content[i].mitigation));
    		}
    	}
    	initHelpTooltip();
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0406') {
            return;
        }
        var tempArrar = [];
        for (var i in vm.keyClientConstraint()) {
            if (vm.keyClientConstraint()[i].checked()) {
                //if the line is checked, use the observable value .
            	tempArrar.push({ inScope: true, constraint: escape(vm.keyClientConstraint()[i].constraint()), constraintTitle: escape(vm.keyClientConstraint()[i].constraintTitle()),description: escape(vm.keyClientConstraint()[i].description()), mitigation: escape(vm.keyClientConstraint()[i].mitigation()) });
            } else {
            	tempArrar.push({ inScope: false, constraint: escape(vm.keyClientConstraint()[i].constraint()), constraintTitle: escape(vm.keyClientConstraint()[i].constraintTitle()), description: "", mitigation: "" });
            }
        }
        vm.section.data.content(tempArrar);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }


    function escapeContent(content) {
    	for (var i in content) {
    		content[i].constraintTitle = escape(content[i].constraintTitle);
    		content[i].description = escape(content[i].description);
    		content[i].mitigation = escape(content[i].mitigation);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].constraintTitle = unescape(content[i].constraintTitle);
    		content[i].description = unescape(content[i].description);
    		content[i].mitigation = unescape(content[i].mitigation);
    	}
    	return content;
    }

    function constraintRow(constraint, constraintTitle, hint, isOriginal, checked, description, mitigation) {
        this.constraint = ko.observable(constraint);
        this.constraintTitle = ko.observable(constraintTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.description = ko.observable(description);
        this.mitigation = ko.observable(mitigation);
    };

    function createOriginalConstraint() {
        var constraintArr = [];
        constraintArr.push(new constraintRow("ClientStandard", "Client-mandated standards and methods", "", true, false, '', ''));
        constraintArr.push(new constraintRow("ClientMandated", "Client-mandated products or tools", "",true, false, '', ''));
        constraintArr.push(new constraintRow("ClientUnionizedSupport", "Client-unionized support","If the client has a unionized labor force that will be impacted by their decision to use HPE services, how will this specifically impact the solution, the cost, delivery risks and commercial terms related to the solution?", true, false, '', ''));
        constraintArr.push(new constraintRow("Regulatory", "Data privacy and regulatory issues", "", true, false, '', ''));
        constraintArr.push(new constraintRow("ExportImport", "Export / import compliance", "Export/import compliance (global trade): Is the client a government organization, or a commercial client, involved in any activity related to the following industries: Military/Defense, Aerospace, Nuclear (including nuclear energy), Chemical, Biotech/Pharma, or High Tech Manufacturing? Does the client have activities or locations in “embargoed” or “Sanctioned” countries [Link to Embargoed/Sanctioned Country List]? Does the proposed scope of work require HPE to package or distribute customer or third party software products?", true, false, '', ''));
        constraintArr.push(new constraintRow("CMO", "HPE CMO responsibilities", "", true, false, '', ''));
        constraintArr.push(new constraintRow("Resource", "HPE or client resources", "", true, false, '', ''));
        constraintArr.push(new constraintRow("LoL", "Limits of Liability", "Describe any client requests for HPE non-standard limits of liability and how the technical solution and commercial terms will be used to mitigate  these risks.", true, false, '', ''));
        constraintArr.push(new constraintRow("OffshoreLocation", "No use of offshore locations", "", true, false, '', ''));
        constraintArr.push(new constraintRow("Timeline", "Timelines and critical dates", "Client-mandated timelines/durations and/or critical dates that HPE will be dependent upon as a part of the deployment of our services.", true, false, '', ''));
        return constraintArr; 
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var constraintViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "key-client-constraints",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.opptyItemData = ko.observable();
    		self.keyClientConstraint = ko.observableArray(createOriginalConstraint());
    		self.initConstraintCount = self.keyClientConstraint().length;
    		self.addRow = function () {
    		    self.keyClientConstraint.push(new constraintRow("Other", "", "", false, true, '', ''));
    		};

    		self.removeRow = function (index) {
    		    var temp = self.keyClientConstraint();
    		    temp.splice(index, 1);
    		    self.keyClientConstraint(temp);
    		};
    	};
    	vm = new constraintViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0406", "sd-section-0406"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/Section0407', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0407Template.html"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        vm = {},
        sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
    	$(window).on("opptySaving", saveOppty);
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});

    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.costingReport != null) {
    	        if (data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.costingReport != null) {
            doDataBinding(data);
        } else {
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var temp = [];
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
                }
                vm.section.data.content(temp);
            }
            vm.pageInited(true);
        }
    }


    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var costingReportViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "costing-reports",
            	data: {
            		content: ko.observable([])
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.pageInited = ko.observable(false);
        };
        vm = new costingReportViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function getCostingApproach() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.costingReport != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    						    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
    						}
    						vm.section.data.content(temp);
    					}
    					vm.pageInited(true);
    				}
    			}
    		});
    	}
    }

    function compareWithAllOffering(allOffering, costingApproach) {
        //compare allOfferings with  costingApproach in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in costingApproach;
            var loc = -1;
            $.each(costingApproach, function (approachIndex, approach) {
                if (approach.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed approach into result ,
                     and end the query in costingApproach;
                     */
                    result.push(approach);
                    loc = approachIndex;
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new resp into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, xmoApproach: "", cmpyTarget: "" });
            }
        });

        return result;
    }

    function doDataBinding(data) {
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var costingApproach = data.solnOverview.costingReport.data.content;
        var result = compareWithAllOffering(allOffering, costingApproach)
        vm.section.data.content(result);
        vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0407') {
            return;
        }

        if (!vm.pageInited()) {
            return;
        }
        var temp = ko.toJS(vm.section.data);
        requestAPI.unifiedSave(true, temp, argu);
    }

    return {
        name: ["Section0407", "sd-section-0407"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});
/*global define, alert, console, location*/
define('component/SDContents', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./SDContentsTemplate.html"),
        TopLink = require("./TopLink"),
        appUtility = require('util/AppUtility'),
        requestAPI = require('model/RequestAPI'),
        OpptyID = require("./OpptyID"),
        vm = {};

    function onViewModelPreLoad() {
        $('#s4-ribbonrow').hide();
        $('#s4-titlerow').hide();

    }

    function onViewModelLoaded(viewModel) {
        vm.opptyID(appUtility.getUrlParameter('OpptyID'));
        if (vm.opptyID() === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getOpptyByIDAsync(vm.opptyID()).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                } else {
                    var data = oppty.data.opptyOverview.opptyData.data;
                    vm.opptyID(data.opptyId);
                    vm.opptyName(data.opptyName);
                }
            });
        }
        $("body").show();
    }

    function createSDContentsViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var sdContentViewModel = function () {
            var self = this;
            self.opptyID = ko.observable("");
            self.opptyName = ko.observable("...");
            self.sdLoaderUrl = sp.app.config.ENV.SectionLoaderUrl;
        };
        vm = new sdContentViewModel(params);
        onViewModelLoaded(vm);
        return vm;
    }

    return {
        name: "SDContents",
        template: templateHtml,
        viewModel: {
            createViewModel: createSDContentsViewModel
        },
        subComponents: [TopLink, OpptyID]
    };

});
/*global define, alert, console, location*/
define("component/SectionLoader", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        requestAPI = require('model/RequestAPI'),
        TopLink = require("./TopLink"),
        templateHtml = require("text!./SectionLoaderTemplate.html"),
        section0201 = require('./Section0201'),
        section0202 = require('./Section0202'),
        section0301 = require('./Section0301'),
        section030201 = require('./Section030201'),
        section030202 = require('./Section030202'),
        section030203 = require('./Section030203'),
        section030204 = require('./Section030204'),
        section040101 = require('./Section040101'),
        section040102 = require('./Section040102'),
        section0402 = require('./Section0402'),
        section040301 = require('./Section040301'),
        section040302 = require('./Section040302'),
        section040303 = require('./Section040303'),
        section040304 = require('./Section040304'),
        section040305 = require('./Section040305'),
        section040306 = require('./Section040306'),
        section040307 = require('./Section040307'),
        section0404 = require('./Section0404'),
        section040501 = require('./Section040501'),
        section040502 = require('./Section040502'),
        section040503 = require('./Section040503'),
        section040504 = require('./Section040504'),
        section040505 = require('./Section040505'),
        section040506 = require('./Section040506'),
        section0406 = require('./Section0406'),
        section0407 = require('./Section0407'),
        appUtility = require('util/AppUtility'),
        saveCompleted = true,
        saveingSid = "",
        sectionModel = {},
        eTag = "",
        viewModel = {};

    function listenCustomEvent() {
        $(window).on('generateMsg', function (e, secName, error, updateMsg) {
            $('.sd-update-message').text(updateMsg);            
            if (error == 0) {
                $('.sd-update-message').addClass('text-success');
                setTimeout(function () {
                    $('.sd-update-message').removeClass('text-success');
                    $('.sd-update-message').text('');
                }, 3000);
            } else {
                $('.sd-update-message').addClass('text-danger');
                setTimeout(function () {
                    $('.sd-update-message').removeClass('text-danger');
                    $('.sd-update-message').text('');
                }, 5000);
            }
            saveCompleted = true;
        });
        $(window).off('submitableChanged');
        $(window).on('submitableChanged', function (e, argu) {
            saveCompleted = argu.submitFlag;
            if (saveCompleted) {
                sp.app.workingDialog.show("Saving section");
                requestAPI.updateSection(argu.viewModel.opptyID(), argu.viewModel.sectionName(), argu.obj, eTag).done(function (data, textStatus, jqXHR) {
                    sp.app.workingDialog.hide("Saving section");
                    if (jqXHR != undefined && saveingSid == argu.viewModel.sid()) {
                        eTag = jqXHR.getResponseHeader('ETag');
                    } else {
                        if (jqXHR === undefined) {
                            requestAPI.errorUpdateSection(data, argu.viewModel.sid(), argu.viewModel.opptyID());
                            sp.app.workingDialog.show("Save section failed");
                            setTimeout(function () {
                                sp.app.workingDialog.hide("Save section failed")
                            }, 3000);
                            if (data.status == 409) {
                                if (confirm("Your current data is now up-to-date, maybe someone have already saved this section!\n Do you want to load the lastest data?")) {
                                    window.location.reload(true);
                                }
                            }
                        } else {
                            updateViewModel(argu.viewModel);
                            //history.pushState("string-data", "section-name", "?sid=" + saveingSid + "&OpptyID=" + argu.viewModel.opptyID() + "")
                        }                        
                    }
                    
                });
            }
        });
    }

    function updateViewModel(argu) {
        argu.sid(saveingSid);
        $(window).trigger('updateSection', argu);
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });
    }

    function onViewModelLoad(viewModel) {
        var sid = appUtility.getUrlParameter('sid');
        saveingSid = sid;
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        viewModel.sid(sid);
        if (viewModel.opptyID() === "") {
            if (sid == '') {
                requestAPI.errorOppty('404');
            } else if(sid == '0201'){   
                //create oppty
            } else {
                viewModel.sectionNavigator(requestAPI.createSectionModel());
            }
        } else {
            viewModel.sectionNavigator(requestAPI.createSectionModel());
        }           
        $('body').show();
    }

    function retriveDocument(viewModel) {
        if (viewModel.opptyID() != "") {
            sp.app.workingDialog.show("Retrieving Section " + viewModel.title());
            requestAPI.getSectionByIDAndSectionNameAsync(viewModel.opptyID(), viewModel.sectionName()).done(function (oppty, xhr) {
                sp.app.workingDialog.hide("Retrieving Section " + viewModel.title());
                if (oppty.status != undefined && oppty.status >= 400) {
                    requestAPI.errorOppty('404');
                } else {
                    if (oppty.data.opptyOverview != null && oppty.data.opptyOverview.opptyData != null) {
                        var data = oppty.data.opptyOverview.opptyData.data;
                        eTag = xhr.getResponseHeader('ETag');
                        viewModel.document(oppty.data);
                        viewModel.oppty.ClientName(data.clientName);
                        viewModel.oppty.OpptyName(data.opptyName);
                        viewModel.pursuitClassfication(data.pursuitClassfication);
                        if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                            viewModel.involvedGbu('apps');
                            viewModel.appsInscope(data.involvedGbu.apps.inScope);
                        }
                        sectionModel = requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope());
                        viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));

                        $(window).trigger('updateSection', viewModel);
                    }
                }
                
            });
        }        
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionModel = requestAPI.createSectionModel('C', 'apps', true);
        var sectionViewModel = function (){
            var self = this;
            self.oppty = {
                OpptyName: ko.observable(""),
                ClientName: ko.observable("")
            };

            self.document = ko.observable();// the entire document
            //self.eTag = ko.observable();            
            self.sectionNavigator = ko.observable(requestAPI.createSectionModel('C', 'apps', true));//section navigator model

            self.opptyID = ko.observable();
            self.sdLoaderUrl = sp.app.config.ENV.SectionLoaderUrl;
            self.sdContentUrl = sp.app.config.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();

            self.editable = ko.observable(true);
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            self.sid = ko.observable();
            self.title = ko.observable();
            self.sectionName = ko.observable();
            self.prevSid = ko.observable();
            self.nextSid = ko.observable();

            self.sid.subscribe(function (newSid){
                for (var i in self.sectionNavigator()) {
                    if (self.sectionNavigator()[i].sid === self.sid()) {
                        self.title(self.sectionNavigator()[i].title);
                        self.sectionName(self.sectionNavigator()[i].sectionName);
                        self.prevSid(self.sectionNavigator()[i].prevSid);
                        self.nextSid(self.sectionNavigator()[i].nextSid);
                        retriveDocument(viewModel);
                        return;
                    }
                }
            });

            self.pursuitClassfication.subscribe(function (newValue) {
                viewModel.pursuitClassfication(newValue);
            });

            self.involvedGbu.subscribe(function (newValue) {
                viewModel.involvedGbu(newValue);
            });

            self.appsInscope.subscribe(function (newValue) {
                viewModel.appsInscope(newValue);
            });

            self.saveHome = function () {
                            
            }
            self.save = function () {
                beforeSave();
                $(window).triggerHandler("opptySaving", self);
            }
            self.saveAndNext = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        saveingSid = self.nextSid();
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }                    
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    saveingSid = self.nextSid();
                }
            }
            self.saveAndPrevious = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        saveingSid = self.prevSid();
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    saveingSid = self.prevSid();
                }
            }
            self.changeSection = function (sid) {
                beforeSave();
                $(window).triggerHandler("opptySaving", viewModel);
                saveingSid = sid;
            }
        },
        viewModel = new sectionViewModel();
        onViewModelLoad(viewModel);
        return viewModel;
    }

    function afterSave() {
        saveCompleted = true;
    }

    function beforeSave() {
        hidePopover();
    }

    function hidePopover() {
        $('.popover').popover('hide');
        $('.popover').remove();
    }

    return {
        name: ["SectionLoader", "sd-section-loader"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [
            section0201,
            section0202,
            section0301,
            section030201,
            section030202,
            section030203,
            section030204,
            section040101,
            section040102,
            section0402,
            section040301,
            section040302,
            section040303,
            section040304,
            section040305,
            section040306,
            section040307,
            section0404,
            section040501,
            section040502,
            section040503,
            section040504,
            section040505,
            section040506,
            section0406,
            section0407,
            TopLink
        ]
    };
});