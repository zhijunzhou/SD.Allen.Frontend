define('model/AppConfig', function (require) {
    "use strict";
    var listCollection = {
        Core: "Core",
        SDCore: "SD%20Core",
        SSDocLib: "SSDocLib"
    },
    releaseVersion = 1,
    datetimepickerOption = {
        format: "MMM D YYYY",
        sideBySide: true
    },
    webAPI = {
        Grip: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
        GDT: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
        HRSoln: 'https://c4w03910.americas.hpqcorp.net/api/salesforce'
    },
    ApiStaging = function() {
        if (window.sd.env == 'qa') {
            return {
                Staging1: 'https://c4w19235.americas.hpqcorp.net'
            }
        } else if (window.sd.env == 'Staging') {
            return {
                Staging1: 'https://c4w17196.americas.hpqcorp.net',
                Staging2: 'https://c4w17197.americas.hpqcorp.net',
                Staging3: 'https://c4w17198.americas.hpqcorp.net',
                Staging4: 'https://c4w17199.americas.hpqcorp.net'
            };
        } else {
            //production env
            return {
                Staging1: 'https://c4w17099.americas.hpqcorp.net',
                Staging2: 'https://c4w17100.americas.hpqcorp.net',
                Staging3: 'https://c4w17101.americas.hpqcorp.net',
                Staging4: 'https://c4w17102.americas.hpqcorp.net'
            };
        }
    },
    ENV = {
        siteRelativeUrl: _spPageContextInfo.siteServerRelativeUrl,
        siteAbsoluteUrl: _spPageContextInfo.siteAbsoluteUrl,
        userId: _spPageContextInfo.userId,
        SectionLoaderUrl: _spPageContextInfo.siteServerRelativeUrl + "/SitePages/SDSectionLoader.aspx",
        SDContentsUrl: _spPageContextInfo.siteServerRelativeUrl + "/SitePages/SDContents.aspx",
        SDDocLibUrl: _spPageContextInfo.siteServerRelativeUrl + "/SSDocLib/"
    };

    return {
        ListCollection: listCollection,
        ReleaseVersion:releaseVersion,
        datetimepickerOption:datetimepickerOption,
        WebAPI: webAPI,
        ApiStaging: ApiStaging(),
        ENV: ENV
    };

});
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
define('model/Oppty', function (require) {
    'use strict';
    var $ = require('jquery'),
        appConfig = require('model/AppConfig'),
        opptyRESTAPI = appConfig.ENV.siteRelativeUrl + "/_api/web/Lists/getbytitle('" + appConfig.ListCollection.SDCore + "')";

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
        var url = appConfig.WebAPI.HRSoln + "?id=" + opptyID;
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
    var $ = require("jquery"),
        appConfig = require('model/AppConfig');

    function getSectionTitleBySid(navTitle,sid) {
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
            new SectionNavigator('030201', 'HPE Win Strategy > Sales Approach', '0301', '030202', 'sales-approach'),
            new SectionNavigator('030202', 'HPE Win Strategy > Competitors', '030201', '030203', 'competitors'),
            new SectionNavigator('030203', 'HPE Win Strategy > Message Map/Value Proposition', '030202', '030204', 'map-value-propositions'),
            new SectionNavigator('030204', 'HPE Win Strategy > Pricing Approach', '030203', '040101', 'pricing-approach'),
            new SectionNavigator('040101', 'Scope > All Offerings', '030204', '040102','unknown'),
            new SectionNavigator('040102', 'Scope > Key Scope Items', '040101',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040301' : '0402','unknown'),
            new SectionNavigator('0402', 'Current State Client Architecture', '040102', '040301','unknown'),
            new SectionNavigator('040301', 'Solution Approach > Summary',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040102' : '0402', '040302','unknown'),
            new SectionNavigator('040302', 'Solution Approach > Outsourcing CMO/TMO/FMO', '040301', '040303','unknown'),
            new SectionNavigator('040303', 'Solution Approach > HR Solution', '040302', '040304','unknown'),
            new SectionNavigator('040304', 'Solution Approach > HPE Internal Challenges and Constraints', '040303',
                (involvedGbu == 'apps' && appsInscope) ? '040305' : '040307','unknown'),
            new SectionNavigator('040305', 'Solution Approach > Design Parameters', '040304', '040306','unknown'),
            new SectionNavigator('040306', 'Solution Approach > Deployment Strategy', '040305', '040307','unknown'),
            new SectionNavigator('040307', 'Solution Approach > Additional Information',
                (involvedGbu == 'apps' && appsInscope) ? '040306' : '040304', '0404','unknown'),
            new SectionNavigator('0404', 'Innovative Aspects of the Solution', '040307', '040501','unknown'),
            new SectionNavigator('040501', 'Delivery Strategies > Delivery Location Targets', '0404', '040505','unknown'),
            new SectionNavigator('040505', 'Delivery Strategies > In-Scope Services Delivery Responsibility', '040501',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040503' : '040506','unknown'),
            new SectionNavigator('040506', 'Delivery Strategies > Client-Retained Services Delivery Responsibility', '040505', '040503','unknown'),
            new SectionNavigator('040503', 'Delivery Strategies > ESM Tooling and Automation Approach',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040505' : '040506', '0406','unknown'),
            new SectionNavigator('0406', 'Key Client Constraints', '040503',
                (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '0201' : '0407','unknown'),
            new SectionNavigator('0407', 'Summary Costing & FTE Reports—Costing Approach', '0406', '0201','unknown')
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
        function uploadFile(libname,filename,file) {                
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
                        success : function(data) {
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
            + "/_api/Web/Folders/add('"+libname+"/"+opptyId+"/"+version+"')";
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
            var ver = appConfig.ReleaseVersion;
            var libname = appConfig.ListCollection.SSDocLib;
            var url = _spPageContextInfo.siteServerRelativeUrl
            + "/_api/web/getfolderbyserverrelativeurl('"+libname+"/"+opptyId+"/"+ver+"')/Files";
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents',
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents/my',
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents',
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID,
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID,
                method: 'GET',
                async:false,
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/'+ sectionName,
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
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/' + sectionName,
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
        function updateSection(opptyID,sectionName,section,eTag) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/'+opptyID+'/sections/'+ sectionName,
                method: 'POST',
                //async: false,
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
                    window.location.href = appConfig.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;
                case '404':
                    alert("OpptyID is not avaiable! Please try another or navigator to home page!");
                    window.location.href = appConfig.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;                
                default: break;
            }
        }

        function errorUpdateSection(data, sid, opptyID) {
            var navTitle = createSectionModel(undefined,undefined,undefined);
            var secName = sid != null ? getSectionTitleBySid(navTitle,sid) : "";
            //var secName = sid != null ? getSectionTitleBySid(sid) : "";
            var updateMsg = "";
            var error = 0;
            if (data == undefined) {
                error = 0;
                updateMsg = "Update Section (" + secName + ") Successfully!";
            } else if (data.status >= 400 && data.status < 500) {
                error = data.status;
                if (sid == null) {
                    updateMsg = "Error: The length of the URL for this request exceeds the configured maxUrlLength value or object file too large .";
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
            getAllAttachments:getAllAttachments,
            getAllOpptyAsync: getAllOpptyAsync,
            getMyOpptyAsyc:getMyOpptyAsyc,
            getSectionByIDAndSectionNameAsync: getSectionByIDAndSectionNameAsync,
            getSectionByIDAndSectionNameSync:getSectionByIDAndSectionNameSync,
            getOpptyByIDAsync: getOpptyByIDAsync,
            updateSection: updateSection,
            errorOppty: errorOppty,
            getOpptyByIDSync:getOpptyByIDSync,
            errorUpdateSection: errorUpdateSection,
            getSectionNameBySid:getSectionNameBySid,
            FixWorkspace: FixWorkspace
    }

});

define('component/TopLink', function (require) {
    "use strict";

    var ko = require("knockout"),
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

    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    Date.prototype.toISOString = function () {
        return this.getUTCFullYear() +
          '-' + pad(this.getUTCMonth() + 1) +
          '-' + pad(this.getUTCDate()) +
          'T' + pad(this.getUTCHours()) +
          ':' + pad(this.getUTCMinutes()) +
          ':' + pad(this.getUTCSeconds()) +
          //'.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z';
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
                        users = self.removeMultipleItem(element, userInfo);
                    $.each(users, function (i, user) {
                        if (user.Resolved) {
                            temp.push({
                                title: user.DisplayText,
                                name: user.Key,
                                email: user.EntityData.Email,
                                sipAddress: user.EntityData.SIPAddress == "" ? null : user.EntityData.SIPAddress,
                                type: user.EntityType
                            });
                        }
                    });
                    disposeObs(obs);
                    obs(temp);
                    subscribeObs(obs);
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
                    }
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
define('component/PopQuesArea', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        ko_tinyMCE = require('ko_tinyMCE'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./PopQuesAreaTemplate.html");

    function onViewModelPreLoad() {
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();        
        var questionViewModel,
             viewModel = function (params, componentInfo) {
                var self = this;
                self.guid = 'sd-question-' + appUtility.newGuid();
                self.config = {
                theme: "modern",
                menubar: false,
                statusbar: false,
                plugins: [
                    "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                    "searchreplace wordcount visualblocks visualchars code fullscreen",
                    "insertdatetime media nonbreaking save table contextmenu directionality filemanager"

                ],
                toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | link image filemanager",
                image_advtab: true
            };  
            self.content = ko.observable("");
            
            if (params !== undefined) {                
                if (params.content != undefined) {
                    self.content(params.content);
                }
            }
        };       
        questionViewModel = new viewModel(params, componentInfo);
        return questionViewModel;
    }

    return {
        name: ["PopQuesArea", "sd-popquesarea"],
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
        appConfig = require('model/AppConfig'),
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
                filePath = appConfig.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filePath;
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
        requestAPI.uploadtoSpecificFolder(appConfig.ListCollection.SSDocLib, "/" + viewModel.opptyID() + "/" + appConfig.ReleaseVersion, file.name, file).done(function (data) {
            //insert hyperlink to content
            if (data.status != undefined && data.status == 400) {
                requestAPI.errorUpdateSection(data,null,null);
            } else {
                var fileUrl = nth_occurrence(data.d.ServerRelativeUrl, '/' + appConfig.ReleaseVersion + '/');
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
                var filePath = appConfig.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filename;
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
        jasnybs = require('jasnybs'),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AllOpptyTemplate.html"),
        opptyModel = require('model/Oppty'),
        TopLink = require("./TopLinkHome"),
        appConfig = require('model/AppConfig'),
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
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var allOpptyViewModel = function () {
            var self = this;
            self.urlPrefix = appConfig.ENV.SDContentsUrl + "?OpptyID=";
            self.opptyList = ko.observable();
        };
        viewModel = new allOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getAllOppties(viewModel) {
        var vm = viewModel;
        requestAPI.getAllOpptyAsync().done(function (oppties) {
            vm.opptyList(oppties);
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


/*global define*/
define('component/AppHome', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        appConfig = require('model/AppConfig'),
        requestAPI = require('model/RequestAPI'),
        ko_auto = require('ko_autocomplete'),
        templateHtml = require("text!./AppHomeTemplate.html"),
        TopLink = require("./TopLinkHome");
      
    function Oppty(data) {
        this.opptyId = "";
        this.clientName = "";
        this.opptyName = "";
        this.displayName = "";


        if (data !== undefined) {
            this.opptyId = data.opptyId;
            this.opptyName = data.opptyName;
            this.clientName = data.clientName;
            this.displayName = data.opptyId + " " + data.clientName + " " + data.opptyName;
        }
    }

    function onViewModelPreLoad() {
        //$('#s4-ribbonrow').hide();
        //$('#s4-titlerow').hide();
    }
    
    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var sdContentieViewModel = function () {
            var self = this;
            self.myValue = ko.observable();
            self.opptyCollection = ko.observableArray();
            requestAPI.getAllOpptyAsync().done(function (oppties) {
                //self.opptyCollection(oppties);
                for (var i in oppties) {
                    self.opptyCollection.push(new Oppty(oppties[i]));
                }
            }, self);

            //define function
            self.redirect2SdContent = function () {
                if (self.myValue().opptyId != undefined)
                    window.location.href = appConfig.ENV.SDContentsUrl + "?OpptyID=" + self.myValue().opptyId;
                else
                    alert("Opportunity not found!");
            }            
        };
        var viewModel = new sdContentieViewModel();
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
        jasnybs = require('jasnybs'),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./MyOpptyTemplate.html"),
        TopLink = require("./TopLinkHome"),
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty');

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
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel,
            myOpptyViewModel = function () {
                var self = this;
                self.urlPrefix = appConfig.ENV.SDContentsUrl + "?OpptyID=";
                self.opptyList = ko.observable();
            };
        viewModel = new myOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getMyOppties(viewModel) {
        var vm = viewModel;
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            vm.opptyList(oppties);
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
        jasnybs = require('jasnybs'),
        TopLink = require("./TopLinkHome"),
        appConfig = require('model/AppConfig'),
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

    function addSDLinkAfterAppHome() {
        appUtility.addSDLinkAfterAppHome();
    }

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
    }

    function getAllAttachments() {
        console.log(viewModel.opptyID);
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
            });
            //getAllAttachments();//get all attachment
        }

    }

    function createViewModel(params, componentInfo) {
        addSDLinkAfterAppHome();
        onViewModelPreLoad();
        var reviewAndExtractviewModel = function (params, componentInfo) {
            var self = this;
            self.document = ko.observable();// the entire document
            self.editable = ko.observable(false);
            self.opptyID = ko.observable();

            self.sdContentUrl = appConfig.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();
            self.sectionNavigator = ko.observable();
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            loadingDocument(self);

            self.toggleLeftMenu = function (e) {
                //e.preventDefault();
                //$('.navmenu').offcanvas('toggle');
                //$('.navmenu').canvas('sd-section-detail');
            };

            $('#sd-section-navbtn').click(function (e) {
                requestAPI.FixWorkspace();
                e.preventDefault();
                //return false;
            });

            $('a').on('click', function () {
                var href = $(this).attr('href');                
                requestAPI.FixWorkspace();
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
            section0407
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
        appConfig = require('model/AppConfig'),
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
            for (var i in vm.attachment()) {
                var fileTag = computePicSrc(vm.attachment()[i].title);
                vm.fileList.push(new attachment(vm.attachment()[i].title, vm.linkBaseUrl + vm.attachment()[i].title, vm.attachment()[i].title, vm.attachmentBaseUrl() + vm.attachment()[i].title, fileTag));
            }
        }
    }

    function updateFileList() {
        if (!vm.attachmentLoaded) {
            for (var i in vm.attachment()) {
                var fileTag = computePicSrc(vm.attachment()[i].title);
                vm.fileList.push(new attachment(vm.attachment()[i].title, vm.linkBaseUrl + vm.attachment()[i].title, vm.attachment()[i].title, vm.attachmentBaseUrl() + vm.attachment()[i].title, fileTag));
            }
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
        requestAPI.uploadtoSpecificFolder(appConfig.ListCollection.SSDocLib, uploader.baseUrl + appConfig.ReleaseVersion, file.name, file).done(function (data) {
            var fileUrl = data.d.ServerRelativeUrl;
            var fileTag = computePicSrc(file.name);
            vm.attachment.push({ title: file.name, link: appConfig.ReleaseVersion + "/" + file.name });
            vm.fileList.push(new attachment(file.name, appConfig.ReleaseVersion + "/" + file.name, file.name, fileUrl, fileTag));
            showAttachment();
        });
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var attachmentManagerViewModel = function (params) {
            var self = this;

            self.linkBaseUrl = "/" + params.viewModel.section.opptyID + "/";
            self.attachmentBaseUrl = ko.observable(appConfig.ENV.SDDocLibUrl + params.viewModel.section.opptyID + "/" + appConfig.ReleaseVersion + "/");

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

    function getFormattedDollar(dollarValue) {
        var dollarStr = dollarValue.toString();
        var formatted = "";
        var l = dollarStr.length;
        var count = 0;
        for (var i = l; i > 0; --i) {
            count = count + 1;
            formatted = dollarStr.charAt(i - 1) + formatted;
            if (count % 3 === 0 && count < l) {
                formatted = "," + formatted;
            }
        }
        formatted = "$" + formatted;
        console.log(formatted);
        vm.formattedDollar(formatted);
    }

    function createViewModel(params, componentInfo) {
        var dollarFormatterViewModel = function (params) {
            var self = this;
            self.dollarValue = params.dollarValue;
            self.formattedDollar = ko.observable("$0");

            //define functions;
            self.getFormattedDollar = function (dollarValue) {
                var dollarStr = dollarValue.toString();
                var formatted = "";
                var l = dollarStr.length;
                var count = 0;
                for (var i = l-1; i >= 0; --i) {
                    count = count + 1;
                    formatted = dollarStr.charAt(i) + formatted;
                    if (count % 3 === 0 && count < l) {
                        formatted = "," + formatted;
                    };
                }
                formatted = "$" + formatted;
                self.formattedDollar(formatted);
            }

            //define subscribes;
            self.dollarValue.subscribe(self.getFormattedDollar);
        };
        return new dollarFormatterViewModel(params);
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
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        numBox = require('numBox'),
        requestAPI = require('model/RequestAPI'),
        dollarFormatter = require('./DollarFormatter'),
        vm = {},
        sectionLoaderViewModel = {};

    var dropdownCollection = {
        salesStage: [
            new Map("01", "01 - Understand the Client"),
            new Map("02", "02 - Validate Opportunity"),
            new Map("03", "03 - Qualify Opportunity"),
            new Map("04", "04 - Develop & Propose Solution"),
            new Map("05", "05 - Negotiate & Close"),
            new Map("06", "06 - Won & Deploy")
        ],
        opptyType: [
            new Map("New Business", "New Business"),
            new Map("UpSell", "UpSell"),
            new Map("Renewal", "Renewal"),
            new Tree("Other", [
                new Map("Add-On", "Add-On"),
                new Map("CrossSell / UpSell", "CrossSell / UpSell"),
                new Map("Defend", "Defend"),
                new Map("Indefinite Delivery/Quantity", "Indefinite Delivery/Quantity"),
                new Map("N/A", "N/A"),
                new Map("Parent", "Parent"),
                new Map("Project", "Project"),
                new Map("Renegotiation", "Renegotiation"),
                new Map("Resell", "Resell"),
                new Map("Run Rate", "Run Rate"),
                new Map("Scope Change", "Scope Change"),
                new Map("Term Contract", "Term Contract"),
                new Map("Upsell", "Upsell"),
                new Map("VolumeGrowth", "VolumeGrowth"),
                new Map("WinBack", "WinBack")
            ])
        ],
        dealStatus: [
            new Map("Open", "Open"),
            new Map("Won", "Won"),
            new Map("Lost", "Lost"),
            new Map("Lost", "Lost"),
            new Map("No Opportunity", "No Opportunity"),
            new Map("Not Awarded", "Not Awarded"),
            new Map("HPE Cancelled", "HPE Cancelled")
        ],
        leadBizUnit: [
            new Map("apps", "APPS"),
            new Map("bps", "BPS"),
            new Map("ess", "Enterprise Security Practice"),
            new Map("ito", "ITO"),
            new Map("hpeOther", "Other HPE"),
            new Map("hpi", "HP Inc.")
        ],
        pursuitClassfication: [
            new Map("A", "A"),
            new Map("B","B"),
            new Map("C","C"),
            new Map("D","D")
        ],
        solnGovTrack: [
            new Map("Focused", "Focused"),
            new Map("Fast", "Fast"),
            new Map("Account", "Account"),
            new Map("Not Applicable", "Not Applicable")
        ],
        countries: [
            new Tree("AMS", [
                new Map("AR","Argentina"),
                new Map("BR","Brazil"),
                new Map("CA","Canada"),
                new Map("CL","Chile"),
                new Map("CO","Colombia"),
                new Map("CR","Costa Rica"),
                new Map("MX","Mexico"),
                new Map("OtherAMS","Other AMS"),
                new Map("PA","Panama"),
                new Map("PE","Peru"),
                new Map("US","United States")
            ]),
            new Tree("APJ", [
                new Map("AU","Australia"),
                new Map("CN","China"),
                new Map("HK","Hong Kong"),
                new Map("IN","India"),
                new Map("ID","Indonesia"),
                new Map("JP","Japan"),
                new Map("KR","Korea"),
                new Map("MY","Malaysia"),
                new Map("NZ","New Zealand"),
                new Map("OtherAPJ","Other APJ"),
                new Map("PH","Philippines"),
                new Map("SG","Singapore"),
                new Map("TW","Taiwan"),
                new Map("TH","Thailand"),
                new Map("VN","Vietnam"),
            ]),
            new Tree("EMEA", [
                new Map("AT","Austria"),
                new Map("BE","Belgium"),
                new Map("BG","Bulgaria"),
                new Map("CZ","Czech Republic"),
                new Map("DK","Denmark"),
                new Map("EG","Egypt"),
                new Map("FI","Finland"),
                new Map("FR","France"),
                new Map("DE","Germany"),
                new Map("GR","Greece"),
                new Map("HU","Hungary"),
                new Map("IE","Ireland"),
                new Map("IL","Israel"),
                new Map("IT","Italy"),
                new Map("LU","Luxembourg"),
                new Map("NL","Netherlands"),
                new Map("NO","Norway"),
                new Map("OtherEMEA","Other EMEA"),
                new Map("PL","Poland"),
                new Map("PT","Portugal"),
                new Map("RO","Romania"),
                new Map("RU","Russia"),
                new Map("SA","Saudi Arabia"),
                new Map("ZA","South Africa"),
                new Map("ES","Spain"),
                new Map("SE","Sweden"),
                new Map("CH","Switzerland"),
                new Map("TR","Turkey"),
                new Map("AE","UAE"),
                new Map("GB","United Kingdom"),
            ])
        ],
        sector: [
            new Map("Commercial Non Binding", "Commercial Non Binding"),
            new Map("Commercial Binding", "Commercial Binding"),
            new Map("Public Sector", "Public Sector")
        ]
    };

    function Map(key, value) {
        return { key: key, value: value };
    }

    function Tree(label, mapList) {
        return {
            label: label,
            mapList:mapList
        }
    }

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        initNumBox();
        $(document).ready(function () {
            // $('.inputUSD').NumBox({ symbol: "$", max: Math.pow(10, 20), min: 0 });
        });
        //$('.inputUSD').getFormatted();
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
            loadOpptyData(vm.section.opptyID);
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

    function saveOppty(event, argu) {
        if (checkRequiredField() === true && checkIdFormat(vm.data.opptyID()) === true && checkContractDate() === true && compareFryAndTcv() === true) {
            $(window).triggerHandler("submitableChanged", true);
            var sid = argu.sid();
            if (sid !== '0201') {
                return;
            }
            if (vm.isNewOppty()) {
                requestAPI.createOpptyDocument(ko.toJS(vm.data)).done(function (data) {
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    if (data != undefined && data.status == undefined) {
                        sid = "0202";
                        window.location.href = appConfig.ENV.SectionLoaderUrl + "?sid=" + sid + "&OpptyID=" + vm.data.opptyID();
                    }
                });
            } else {
                vm.data.pursuitWeb.link(vm.data.pursuitWeb.link());
                requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
                    if (jqXHR != undefined)  vm.section.eTag = jqXHR.getResponseHeader('ETag');
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    //update top oppty info
                    sectionLoaderViewModel.oppty.OpptyName(vm.data.opptyName());
                    sectionLoaderViewModel.oppty.ClientName(vm.data.clientName());
                });
            }
        } else {
            $(window).triggerHandler("submitableChanged", false);
        }
    }

    function loadOpptyData(opptyID) {
        requestAPI.getSectionByIDAndSectionNameAsync(opptyID, vm.section.name).done(function (oppty,xhr) {
            if (oppty.data === undefined) {
                vm.data.opptyID(opptyID);
            } else {
                vm.section.eTag = xhr.getResponseHeader('ETag');
                var data = oppty.data.opptyOverview.opptyData.data;
                vm.data.opptyID(data.opptyId);
                vm.data.opptyName(data.opptyName);
                vm.data.salesStage(data.salesStage);

                //escope the spacing;
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
        }).then(function (oppty) {
            //query sales force
        });
    }

    function loadGripData(opptyID) {
        if (opptyID !== undefined && opptyID !== "") {
            requestAPI.getOpptyByIDAsync(opptyID).done(function (xhr) {
                if (xhr.status == "404") {
                    vm.existedInSystem(false);
                    vm.isNewOppty(true);
                    opptyModel.getOpptyOverviewAsync(opptyID).done(function (opptyOverview) {
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
            //self.data.opptyID.subscribe(loadGripData);
            self.inputOpptyId = ko.observable();
            self.inputOpptyId.subscribe(checkOpptyId);
            //self.data.leadBizUnit.subscribe(updateLeadGBU);
            self.leadCntryName = ko.observable();
            self.clientCntryName = ko.observable();
            self.salesStageName = ko.observable();
            //define dropdown list observable
            self.salesStageAvailable = dropdownCollection.salesStage;
            self.opptyTypeAvailable = dropdownCollection.opptyType;
            self.dealStatusAvailable = dropdownCollection.dealStatus;
            self.leadBizUnitAvailable = dropdownCollection.leadBizUnit;
            self.pursuitClassficationAvailable = dropdownCollection.pursuitClassfication;
            self.solnGovTrackAvailable = dropdownCollection.solnGovTrack;
            self.countriesAvailable = dropdownCollection.countries;
            self.sectorAvailable = dropdownCollection.sector;

            self.validId = ko.observable();
            //define functions
            self.loadGrip = function () {
                checkOpptyId();
            }
        }

        vm = new opptyViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.editable(sectionLoaderViewModel.editable());
        onViewModelLoaded();
        return vm;
    }

    function validateTcvOrFyr() {
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
        //vm.data = new opptyData();
        //var opptyOvewviewSection = document.getElementById("sd-section-0201");
        //ko.cleanNode(opptyOvewviewSection);
        //ko.applyBindings(createViewModel(sectionLoaderParams));
        cleanBindings();
        if (inputOpptyId != "" && checkIdFormat(inputOpptyId)) {
            vm.validId(true);
            loadGripData(inputOpptyId);
        } else {
            vm.validId(false);
        }
    }

    function checkIdFormat(opptyId) {
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
        validateTcvOrFyr();
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

    function checkContractDate() {
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
        appConfig = require('model/AppConfig'),
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
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }
    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            getContact();
        } else {
            var data = sectionLoaderViewModel.document();
            var opptyOverview = data.opptyOverview;
            if (opptyOverview != null && opptyOverview.contact != null) {
                doDataBinding(data);
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
        var tempOppty = sectionLoaderViewModel.document().opptyOverview.opptyData.data;
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
                setTimeout(saveFunc, 500);
            } else {
                var mappingResult = doDataMapping();
                //if (!vm.peoplePickerInited()) {
                //    console.log("peoplePicker has not been inited !");
                //    return;
                //}
                if (!mappingResult.isEmpty) {
                    $(window).trigger("submitableChanged", { submitFlag: true, obj: mappingResult.data });

                    requestAPI.updateSection(vm.section.opptyID, vm.section.name, mappingResult.data, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                        if (jqXHR != undefined) vm.section.eTag = jqXHR.getResponseHeader('ETag');
                        requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    });
                } else {
                    $(window).triggerHandler("submitableChanged", false);
                    alert("Fill in one contact at least!");
                }
            }
        }
        setTimeout(saveFunc, 500);
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
        jasnybs = require('jasnybs'),
        select2 = require('select2'),
        dateTimePicker = require('./DateTimePicker'),
        questionArea = require("./QuestionArea"),
        opptyModel = require('model/Oppty'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        countrySelector = require('./CountrySelector'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section0301Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function ClientOverview(data) {
        if (data != undefined && data != null) {
            this.clientRevenue = setEscapeValue(data.clientRevenue());
            this.clientRevenueYear = data.clientRevenueYear();
            this.noBusinessUnits = data.noBusinessUnits();
            this.inWhatCountries = data.inWhatCountries();
            this.acctBizPlanImpactPointDetail = data.acctBizPlanImpactPointDetail();
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
            this.clientEventDetail = null;//this field have been delete in frontend, but it still exist in backend
        }
    }

    function setEscapeValue(val) {
        return val === undefined ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function unescapeData(data) {       
        vm.data.clientRevenue (getUnEscapeValue( data.clientRevenue));
        vm.data.clientRevenueYear(data.clientRevenueYear == null ? "" : data.clientRevenueYear);
        vm.data.noBusinessUnits ( data.noBusinessUnits);
        vm.data.inWhatCountries ( data.inWhatCountries);
        vm.data.acctBizPlanImpactPointDetail ( data.acctBizPlanImpactPointDetail);
        vm.data.explainImpact (getUnEscapeValue( data.explainImpact));
        vm.data.priBizChlgDetail (getUnEscapeValue( data.priBizChlgDetail));
        vm.data.clientCompellingEventDetail (getUnEscapeValue( data.clientCompellingEventDetail));
        vm.data.curItStateDetail (getUnEscapeValue( data.curItStateDetail));
        vm.data.keyDifferentiation (getUnEscapeValue( data.keyDifferentiation));
        vm.data.buRelationDetail (getUnEscapeValue( data.buRelationDetail));
        vm.data.hpiRelationDetail (getUnEscapeValue( data.hpiRelationDetail));
        vm.data.clientFcnDetail (getUnEscapeValue( data.clientFcnDetail));
        vm.data.clientDecisionCriteriaDetail (getUnEscapeValue( data.clientDecisionCriteriaDetail));
        vm.data.clientProcApproach ( data.clientProcApproach);
        vm.data.accountDeliveryMgmtDetail(getUnEscapeValue(data.accountDeliveryMgmtDetail));
        //select2
        $('#inWhatCountries').val(data.inWhatCountries).trigger("change");
    }

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);  
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
            //self.section = {
            //    opptyID: "",
            //    eTag: "",
            //    sectionName: "client-overview",
            //    loaded: ko.observable(false)
            //};
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);

            self.draftData = ko.observable();//prepare for comparision
            
            self.data = {
                clientRevenue : ko.observable(),
                clientRevenueYear: ko.observable(),
                noBusinessUnits: ko.observable(),
                inWhatCountries : ko.observableArray(),        //countries are multiple value
                acctBizPlanImpactPointDetail: ko.observable(),
                explainImpact: ko.observable(),
                priBizChlgDetail : ko.observable(),
                clientCompellingEventDetail : ko.observable(),
                curItStateDetail : ko.observable(),
                keyDifferentiation : ko.observable(),
                buRelationDetail: ko.observable(),
                hpiRelationDetail: ko.observable(),
                clientFcnDetail: ko.observable(),
                clientDecisionCriteriaDetail : ko.observable(),
                clientProcApproach : ko.observable(),
                accountDeliveryMgmtDetail: ko.observable()
            };

            //select2
            $('#inWhatCountries').select2({ tags: true });
            self.selectedCnty = ko.observable();

            self.save = function () {
                saveOppty();
            }
        };
        vm = new clientOverViewModel(params);
        //vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function loadingSection() {
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
        if (JSON.stringify(newData) === JSON.stringify(ko.toJS(vm.draftData))) {
            alert("Nothing Changed!");
        } else {
            //compare their properties
            if (appUtility.compareJson(newData, ko.toJS(vm.draftData)) === false) {
                $(window).trigger("submitableChanged", {
                    submitFlag: true,
                    obj: newData,
                    opptyID: argu.opptyID(),
                    eTag: argu.eTag(),
                    sectionName: argu.sectionName(),
                    sid: sid
                });
            } else {
                alert("Nothing Changed!");
            }
        }        
    }

    return {
        name: ["Section0301", "sd-section-0301"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [questionArea, dateTimePicker, countrySelector]
    };

});
/*global define, alert, console, location*/

define('component/Section030201', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        errorPage = require('./SDErrorPage'),
        opptyModel = require('model/Oppty'),
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
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function onViewModelLoaded() {
        
    }

    //before binding, we should unescape the original data from DB
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
            //self.section = {
            //    opptyID: "",
            //    eTag: "",
            //    sectionName: "sales-approach",
            //    loaded: ko.observable(false)
            //};
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                salesStrategyDetail : ko.observable(),
                clientTransformationStrategyDetail : ko.observable(),
                dealBenefitDetail : ko.observable(),
                criticalSuccessFactorDetail : ko.observable(),
                dealEssentialDetail : ko.observable(),
                sumryRelationStrategyDetail : ko.observable(),
                specificSolnRqmtDetail : ko.observable(),
                supporterDetractorDetail : ko.observable(),
                bizPartnerDetail : ko.observable()
            };

            //save data and error handling
            self.save = function () {
                saveOppty();
            }
        }
        vm = new salesApprViewModel(params);
        //vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function loadingSection() {
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
        //compare their properties
        if (appUtility.compareJson(newData, ko.toJS(vm.draftData)) === false) {
            $(window).trigger("submitableChanged", {
                submitFlag: true,
                obj: newData,
                opptyID: argu.opptyID(),
                eTag: argu.eTag(),
                sectionName: argu.sectionName(),
                sid: sid
            });
        }
    }


    return {
        name: ["Section030201", "sd-section-030201"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        },
        subComponents: [errorPage]
    };
   
});

/*global define, alert, console, location*/
define('component/Section030202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030202Template.html"),
        vm = {},
        sectionLoaderViewModel = {};
    
    function listenCustomEvent() {
    	$(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function KeyCompetitor(data) {
        if (data != null) {
            return {
                name: data.name,
                strengthDetail: escape(data.strengthDetail),
                weaknessDetail: escape(data.weaknessDetail),
                advantageDetail: escape(data.advantageDetail)
            };
        }
        return {
            name: "",
            strengthDetail: "",
            weaknessDetail: "",
            advantageDetail: ""
        };
    }

    function unescapeData(data) {
        vm.data.competitorNum(data.competitorNum);
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                vm.data.content[i].name(data.content[i].name);
                vm.data.content[i].strengthDetail(unescape(data.content[i].strengthDetail));
                vm.data.content[i].weaknessDetail(unescape(data.content[i].weaknessDetail));
                vm.data.content[i].advantageDetail(unescape(data.content[i].advantageDetail));
            }
        }
    }

    function initKeyCompetitor(num) {
        for (var i = 0; i < num, i < 4; i++) {
            vm.data.content.push(new KeyCompetitor());
        }        
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.section.opptyID === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.sectionName).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                }
                else {
                    if (oppty.data.bizSoln != null) {
                        var bizSoln = oppty.data.bizSoln;
                        if (bizSoln != null && bizSoln.winStrategy!=null && bizSoln.winStrategy.competitors != null) {
                            var data = bizSoln.winStrategy.competitors.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                        } else {
                            //initKeyCompetitor(4);
                        }
                    }
                    return this.promise();
                }
            });
        }
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var competitorsViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "competitors",
            };
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

            self.isInteger = ko.observable(true);

            //subscrbe
            self.data.competitorNum.subscribe(checkNum);
            
            $(".popover-options a").popover({ html: true });
            $('.popover-show').popover('show');

            self.save = function () {
                if(checkNum(self.data.competitorNum()))
                    saveOppty();
            }

        };
        vm = new competitorsViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function checkNum(inputText) {
        var reg = /^\+?(0|[1-9]\d*)$/;
        if (reg.test(inputText)) {
            //is integer
            vm.isInteger(true); return true;
        } else {
            //not integer
            vm.isInteger(false); return false;
        }
    }

    function loadingSection() {
        if (sectionLoaderViewModel.editable()) {
            onViewModelLoaded(vm);
        } else {
            var doc = ko.toJS(sectionLoaderViewModel.document);
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.competitors != null)
                unescapeData(doc.bizSoln.winStrategy.competitors.data);
        }
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030202') {
            return;
        } else {
            var newData = ko.toJS(vm.data);
            for (var i in newData.content) {
                newData.content[i] = new KeyCompetitor(newData.content[i]);
            }
            requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                if (jqXHR != undefined)
                    vm.section.eTag = jqXHR.getResponseHeader('ETag');
                requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
            });
        }
        
    }

    return {
        name: ["Section030202", "sd-section-030202"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        },        
        subComponents: [inputText]
    };
   
});

define('component/Section030203', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030203Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function MapValProp(data) {
        if (data != null) {
            return {
                clientBizDetail: data.clientBizDetail,
                chlgImpactDetail: escape(data.chlgImpactDetail),
                capabilityDetail: escape(data.capabilityDetail),
                evidenceDetail: escape(data.evidenceDetail)
            };
        }
        return {
            clientBizDetail: "",
            chlgImpactDetail: "",
            capabilityDetail: "",
            evidenceDetail: ""
        };
    }
       
    //before binding, we should unescape the original data from DB
    function unescapeData(data) {
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].clientBizDetail = unescape(data.content[i].clientBizDetail);
                data.content[i].chlgImpactDetail = unescape(data.content[i].chlgImpactDetail);
                data.content[i].capabilityDetail = unescape(data.content[i].capabilityDetail);
                data.content[i].evidenceDetail = unescape(data.content[i].evidenceDetail);
            } 
        } else {
            data.content.push(new MapValProp(null));
        }        
        vm.data.content(data.content);
    }

    function listenCustomEvent() {
    	$(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
        //pop-up tooltip           
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
        listenCustomEvent();
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.section.opptyID === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.sectionName).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                }
                else {
                    if (oppty.data.bizSoln != null) {
                        var bizSoln = oppty.data.bizSoln;
                        if (bizSoln != null && bizSoln.winStrategy != null && bizSoln.winStrategy.mapValProps != null) {
                            var data = bizSoln.winStrategy.mapValProps.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                        } else {

                        }
                    }
                    return this.promise();
                }
            });
        }
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var mapValPropViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "map-value-propositions",
            };

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
            
            self.save = function () {
                saveOppty();
            }
        };
        vm = new mapValPropViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function loadingSection() {
        if (sectionLoaderViewModel.editable()) {
            onViewModelLoaded(vm);
        } else {
            var doc = ko.toJS(sectionLoaderViewModel.document);
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.mapValProps != null)
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
            requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                if (jqXHR != undefined)
                    vm.section.eTag = jqXHR.getResponseHeader('ETag');
                requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
            });
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

/*global define, alert, console, location*/

define('component/Section030204', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
        requestAPI = require('model/RequestAPI'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        templateHtml = require("text!./Section030204Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function PricingApproach(data) {
        if (data != null) {
            if (data.yellowPadPricePercentage() == undefined || data.yellowPadPricePercentage() == null || data.yellowPadPricePercentage() == "")
                data.yellowPadPricePercentage(0);
            //return {
            this.isYellowPadPrice = data.isYellowPadPrice() == 1 ? true : false;
            this.yellowPadPricePercentage = data.yellowPadPricePercentage() * vm.lowOrHigher();
            this.clientPriceExpectDetail = escape(data.clientPriceExpectDetail());
            this.clientPriceStrategyDetail = escape(data.clientPriceStrategyDetail());
            this.cmpyPriceStrategyDetail = escape(data.cmpyPriceStrategyDetail());
            this.competitorPriceStrategyDetail = escape(data.competitorPriceStrategyDetail());
            this.majorFinancialIssue = escape(data.majorFinancialIssue());
            //};  
        }
    }

    function unescapeData(data) {
        if (data.yellowPadPricePercentage <= 0) {
            vm.lowOrHigher(-1);
        } else {
            vm.lowOrHigher(1);
        }
        vm.data.isYellowPadPrice(data.isYellowPadPrice);
        vm.data.yellowPadPricePercentage(Math.abs(data.yellowPadPricePercentage));
        vm.data.clientPriceExpectDetail(unescape(data.clientPriceExpectDetail != null ? data.clientPriceExpectDetail : ""));
        vm.data.clientPriceStrategyDetail(unescape(data.clientPriceStrategyDetail != null ? data.clientPriceStrategyDetail : ""));
        vm.data.cmpyPriceStrategyDetail(unescape(data.cmpyPriceStrategyDetail != null ? data.cmpyPriceStrategyDetail : ""));
        vm.data.competitorPriceStrategyDetail(unescape(data.competitorPriceStrategyDetail != null ? data.competitorPriceStrategyDetail : ""));
        vm.data.majorFinancialIssue(unescape(data.majorFinancialIssue != null ? data.majorFinancialIssue : ""));
    }

    function listenCustomEvent() {
    	$(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
        //pop-up tooltip           
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
        listenCustomEvent();
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.section.opptyID === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.sectionName).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                }
                else {
                    console.log(oppty);
                    if (oppty.data.bizSoln != null) {
                        var bizSoln = oppty.data.bizSoln;
                        if (bizSoln != null && bizSoln.winStrategy != null && bizSoln.winStrategy.pricingApproach != null) {
                            var data = bizSoln.winStrategy.pricingApproach.data;
                            vm.draftData(data);
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                        } else {
                            //other processing
                        }
                    }
                    return this.promise();
                }
            });
        }
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var pricingApproachViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "pricing-approach",
            };
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                isYellowPadPrice : ko.observable(true),
                yellowPadPricePercentage : ko.observable(0),
                clientPriceExpectDetail : ko.observable(),
                clientPriceStrategyDetail : ko.observable(),
                cmpyPriceStrategyDetail : ko.observable(),
                competitorPriceStrategyDetail : ko.observable(),
                majorFinancialIssue : ko.observable()
            };

            self.draftData = ko.observable();


            //low or higher
            self.lowOrHigher = ko.observable(1);

            self.save = function () {
                saveOppty();
            }
        };
        vm = new pricingApproachViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function loadingSection() {
        if (sectionLoaderViewModel.editable()) {
            onViewModelLoaded(vm);
        } else {
            var doc = ko.toJS(sectionLoaderViewModel.document);
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.pricingApproach != null)
                unescapeData(doc.bizSoln.winStrategy.pricingApproach.data);
        }
    }

    function saveOppty(event, argu) {        
        var sid = argu.sid();
        if (sid !== '030204') {
            return;
        } else {
            var newData = new PricingApproach(vm.data);
            if (JSON.stringify(newData) === JSON.stringify(ko.toJS(vm.draftData))) {
                alert("Nothing Changed!");
            } else {
                vm.draftData(newData);
                requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                    if(jqXHR != undefined) vm.section.eTag = jqXHR.getResponseHeader('ETag');
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                });
            }
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
        vm = {},
        sectionLoaderViewModel = {};

	function listenCustomEvent() {
		$(window).off("opptySaving");
	    $(window).on("opptySaving", saveOppty);
	}

	function onViewModelPreLoad() {
		listenCustomEvent();
	}

	function onViewModelLoaded() {
		vm.section.opptyID = sectionLoaderViewModel.opptyID();
		if (vm.editable()) {
			getScopeOffering(); 
		} else {
		    var data = sectionLoaderViewModel.document();
		    var solnOverview = data.solnOverview;
		    if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
		        doDataBinding(data);
		    }

		}
	}

	function offering(offering) {
		this.serviceLine = offering.serviceLine;
		this.offering = offering.offering;
		this.clientVolume = offering.clientVolume;
		this.nStdComponent = offering.nStdComponent;
	}

	function getScopeOffering() {
		if (vm.section.opptyID === "") {
			
		} else {
			requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
				if (oppty.status != undefined && oppty.status == 404) {
					requestAPI.errorOppty('404');
				}
				else {
					var solnOverview = oppty.data.solnOverview;
					if (solnOverview != null && solnOverview.scope !=null && solnOverview.scope.allOfferings != null) {
						vm.section.eTag = xhr.getResponseHeader('ETag');
						doDataBinding(oppty.data);
					} else {
						//load productLines from saleforce if the opptyID exist in grip;
						opptyModel.getOpptyOverviewAsync(vm.section.opptyID).done(function (opptyOverview) {
							if (opptyOverview == undefined) {
							} else {
								initOfferings(opptyOverview.productLine);	
							}
						});
					}
				}
			});
		}
	}
 
	function doDataBinding(data) {
		var content = data.solnOverview.scope.allOfferings.data.content;
		vm.section.data.content(unescapeContent(content));
	}

	function initOfferings(productLine) {
		var offering = vm.section.data.content();
		for (var k in productLine) {
			offering.push({ serviceLine: productLine[k].serviceLine, offering: productLine[k].offering, clientVolume: "", nStdComponent: "" });
		}
		vm.section.data.content(offering);
	}

	function saveOppty(event, argu) {
	    var sid = argu.sid();
	    if (sid !== '040101') {
	        return;
	    }
		vm.section.data.content(escapeContent(vm.section.data.content()));
		requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.section.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
			vm.section.eTag = jqXHR.getResponseHeader('ETag');
			requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
		});
	}

	function escapeContent(content){
		for(var i in content){
			content[i].nStdComponent = escape(content[i].nStdComponent);
		}
		return content;
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

			self.addRow = function () {
				var temp = self.section.data.content();
				temp.push({ serviceLine: "", offering: "", clientVolume: "", nStdComponent: "" });
				self.section.data.content(temp);
			};

			self.removeRow = function (index) {
				var temp = self.section.data.content();
				temp.splice(index, 1);
				self.section.data.content(temp);
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getKeyScopeItem();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.keyScopeItem != null) {
    	        doDataBinding(data);
            }
    	}
    }

    function getKeyScopeItem() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.keyScopeItem != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
        appConfig = require('model/AppConfig'),
        attachmentManager = require('./AttachmentManager'),
        appUtility = require('util/AppUtility'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
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
    		getClientArch();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.clientArch != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getClientArch() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.clientArch != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
                        //init attachment with empty array;
    				    vm.section.data.attachment([]);
    				}
    			}
    		});
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
    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getSummary();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.summary != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getSummary() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.summary != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getOutSourcing();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.xmo != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getOutSourcing(viewModel) {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.xmo != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    				    //init attachment with empty array;
    				    vm.section.data.attachment([]);
    				}
    			}
    		});
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
    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getHRSoln();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.hrSoln != null) {
    	        doDataBinding(data);
    	    }
    	}    
    }

    function hrSoln(hrIssue, approach) {
        self.hrIssue = hrIssue;
        self.approach = approach;
    };

    function getHRSoln() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.hrSoln != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}                   
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.hrSoln.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		if (i < vm.initIssueCount) {
    			vm.hrSolutionContent()[i].approach(content[i].approach);
    			vm.hrSolutionContent()[i].checked(content[i].inScope);
    		} else {
    			vm.hrSolutionContent.push(new vm.hrSolnRow(content[i].hrIssue, content[i].hrIssueTitle, true, content[i].inScope, content[i].approach));
    		}
    	}
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
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
    		self.hrSolnRow = function (hrIssue, hrIssueTitle, isOriginal, checked, approach) {
    			this.hrIssue = ko.observable(hrIssue);
    			this.hrIssueTitle = ko.observable(hrIssueTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.approach = ko.observable(approach);
    		};

    		var hrSolnArray = [];
    		hrSolnArray.push(new self.hrSolnRow("ClientEmployee", "Client's Employees", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("ClientSubcontractor", "Client's Subcontractors", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("ClientContractor", "Client's Third Party Contractors", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("HPEmployee", "Existing HPE Employees (Renewals only)", true, false, ''));
    		self.initIssueCount = hrSolnArray.length;
    		self.hrSolutionContent = ko.observableArray(hrSolnArray);

    		self.addRow = function () {
    		    self.hrSolutionContent.push(new self.hrSolnRow("Other", "", false, true, ""))
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getCmpyChallenge();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.cmpyChallenge != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getCmpyChallenge() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.cmpyChallenge != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);	
    				} else {
    					self.isNewSection = true;
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.cmpyChallenge.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		if (i < vm.initChallengeCount) {
    			vm.cmpyChallenge()[i].description(content[i].description);
    			vm.cmpyChallenge()[i].checked(content[i].inScope);
    		} else {
    			vm.cmpyChallenge.push(new vm.challengeRow(content[i].challenge, content[i].challengeTitle, true, content[i].inScope, content[i].description));
    		}
    	}
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
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
    		self.challengeRow = function (challenge, challengeTitle, isOriginal, checked, description) {
    			this.challenge = ko.observable(challenge);
    			this.challengeTitle = ko.observable(challengeTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.description = ko.observable(description);
    		};

    		var challengeArr = [];
    		challengeArr.push(new self.challengeRow("Asset", "Asset ownership/refresh", true, false, ''));
    		challengeArr.push(new self.challengeRow("Trade", "Global Trade requirements", true, false, ''));
    		challengeArr.push(new self.challengeRow("Initiative", "Internal initiatives that could impact deal", true, false, ''));
    		challengeArr.push(new self.challengeRow("Knowledge", "Knowledge and supportability gaps", true, false, ''));
    		challengeArr.push(new self.challengeRow("Legal", "Legal issues related to solution", true, false, ''));
    		challengeArr.push(new self.challengeRow("Sourcing", "Location Sourcing limitations", true, false, ''));
    		challengeArr.push(new self.challengeRow("Staffing", "Staffing Issues", true, false, ''));

    		self.initChallengeCount = challengeArr.length;
    		self.cmpyChallenge = ko.observableArray(challengeArr);
    		self.addRow = function () {
    		    self.cmpyChallenge.push(new self.challengeRow("Other", "", false, true, ''));
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getDesignParam();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.designParam != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getDesignParam() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.designParam != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getDeployStrategy();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.deployStrategy != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getDeployStrategy() {

    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				//alert(JSON.stringify(oppty));
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.deployStrategy != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getAdditionalInfo();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.additionalInfo != null) {
    	        doDataBinding(data);
    	    }
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


    function getAdditionalInfo() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.additionalInfo != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    				    //init attachment with empty array;
    				    vm.section.data.attachment([]);
    				}
    			}
    		});
    	}
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

    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getInnovativeAspect();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.innovativeAspect != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getInnovativeAspect() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.innovativeAspect != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getLocationTarget();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.locationTarget != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function getLocationTarget() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.locationTarget != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, clientVolume: allOffering[k].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
    						}
    						vm.section.data.content(temp);
    					}
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var locationTarget = data.solnOverview.deliveryStrategies.locationTarget.data.content;
    	//compare allOfferings with  locationTarget in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var targetLength = locationTarget.length;
    	var offeringLength = allOffering.length;
    	var x, y;
    	if (offeringLength == 0) {
    		locationTarget = [];
    		targetLength = locationTarget.length;
    	}

    	if (targetLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < targetLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != locationTarget[y].offering) {
    				locationTarget.splice(y, 1);
    				targetLength = targetLength - 1;
    				y = x;
    			} else {
    				locationTarget[y].clientVolume = allOffering[y].clientVolume;
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = targetLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			locationTarget.push({ offering: allOffering[index].offering, clientVolume: allOffering[index].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
    		}
    	}

    	while (x < y) {
    	    locationTarget.splice(x, 1);
    	    y = y - 1;
    	}

    	vm.section.data.content(unescapeContent(locationTarget));
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040501') {
            return;
        }
        vm.section.data.content(escapeContent(vm.section.data.content()));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.section.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].comment = escape(content[i].comment);
    	}
    	return content;
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getEmsTooling();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.emsTooling != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getEmsTooling() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.emsTooling != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var emsTooling = unescapeContent(data.solnOverview.deliveryStrategies.emsTooling.data);
    	vm.section.data.clientToolDetail(emsTooling.clientToolDetail);
    	vm.section.data.cmpyServiceDetail(emsTooling.cmpyServiceDetail);
    	vm.section.data.cmpyApproachDetail(emsTooling.cmpyApproachDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040503') {
            return;
        }
    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
    	var emsToolingViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "ems-tooling",
    			data: {
    				clientToolDetail: ko.observable(""),
    				cmpyServiceDetail: ko.observable(""),
    				cmpyApproachDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new emsToolingViewModel(params);
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
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
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
    		getDeliveryResp();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.svcDeliveryResp != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function deliveryResp(resp) {
    	var me = this;
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
            		content: ko.observableArray([])
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.svcDeliveryResp = ko.observableArray([]);
        };
        vm = new svcDeliveryRespViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function getDeliveryResp() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.svcDeliveryResp != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					var temp = vm.section.data.content();
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
    						}
    						vm.section.data.content(temp);
    						for (var resp in temp) {
    						    vm.svcDeliveryResp.push(new deliveryResp(temp[resp]));
    						}
    					} else {

    					}
    				}
    			}
    		});
    	}
    }


    function doDataBinding(data) {
    	var svcDeliveryResp = unescapeContent(data.solnOverview.deliveryStrategies.svcDeliveryResp.data.content);
    	//compare allOfferings with svcDeliveryResp in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var respLength = svcDeliveryResp.length;
    	var offeringLength = allOffering.length;
    	var x, y;
    	if (offeringLength == 0) {
    		svcDeliveryResp = [];
    		respLength = svcDeliveryResp.length;
    	}

    	if (respLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < respLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != svcDeliveryResp[y].offering) {
    				svcDeliveryResp.splice(y, 1);
    				respLength = respLength - 1;
    				y = x;
    			} else {
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = respLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			svcDeliveryResp.push({ offering: allOffering[index].offering, delivery: "", otherBuDelivery: "",specificBuDelivery:"", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
    		}
    	}

    	while (x < y) {
    	    svcDeliveryResp.splice(x, 1);
    	    y = y - 1;
    	}

    	vm.section.data.content(svcDeliveryResp);
    	for (var resp in svcDeliveryResp) {
    		vm.svcDeliveryResp.push(new deliveryResp(svcDeliveryResp[resp]));
    	}
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040505') {
            return;
        }
        var svcDeliveryResp = doDataMapping();
        //alert(JSON.stringify(temp));
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, svcDeliveryResp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    function doDataMapping() {
    	var svcDeliveryResp = [];
    	for (var resp in vm.svcDeliveryResp()) {
    		svcDeliveryResp.push({ offering: vm.svcDeliveryResp()[resp].offering(), delivery: vm.svcDeliveryResp()[resp].delivery(), otherBuDelivery: vm.svcDeliveryResp()[resp].otherBuDelivery(), specificBuDelivery: vm.svcDeliveryResp()[resp].specificBuDelivery(), partnerDelivery: vm.svcDeliveryResp()[resp].partnerDelivery(), thirdPartyDelivery: vm.svcDeliveryResp()[resp].thirdPartyDelivery(), comment: vm.svcDeliveryResp()[resp].comment(), });
    	}
    	vm.section.data.content(svcDeliveryResp);
    	return escapeContent(ko.toJS(vm.section.data));
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].comment = escape(content[i].comment);
    	}
    	return content;
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
            getDeliveryResp();
        } else {
            var data = sectionLoaderViewModel.document();
            var solnOverview = data.solnOverview;
            if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.clientRetainedResp != null) {
                doDataBinding(data);
            }
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

    function getDeliveryResp() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.clientRetainedResp != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040506') {
            return;
        }
    	var newData = {};
    	var newDataArr = new Array;
    	for (var i in vm.data.content()) {
    	    newDataArr.push(new DeliveryResp(vm.data.content()[i]));
    	}
    	newData = { "content": newDataArr };
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    	    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	    vm.section.eTag = jqXHR.getResponseHeader('ETag');
    	});
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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getConstraint();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.keyClientConstraint != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getConstraint() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				//alert(JSON.stringify(oppty));
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.keyClientConstraint != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.keyClientConstraint.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		//the number of original issues is 4 ,which equals the length of hrSolutionContent(before use '+ ' button to add rows)
    		if (i < vm.initConstraintCount) {
    			vm.keyClientConstraint()[i].checked(content[i].inScope);
    			vm.keyClientConstraint()[i].description(content[i].description);
    			vm.keyClientConstraint()[i].mitigation(content[i].mitigation);
    		} else {
    			vm.keyClientConstraint.push(new vm.constraintRow(content[i].constraint, content[i].constraintTitle, true, content[i].inScope, content[i].description, content[i].mitigation));
    		}
    	}
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
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
    		self.constraintRow = function (constraint, constraintTitle, isOriginal, checked, description, mitigation) {
    			this.constraint = ko.observable(constraint);
    			this.constraintTitle = ko.observable(constraintTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.description = ko.observable(description);
    			this.mitigation = ko.observable(mitigation);
    		};

    		self.opptyItemData = ko.observable();
    		var constraintArr = [];
    		constraintArr.push(new self.constraintRow("ClientStandard", "Client-mandated standards and methods", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ClientMandated", "Client-mandated products or tools", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ClientUnionizedSupport", "Client-unionized support", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Regulatory", "Data privacy and regulatory issues", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ExportImport", "Export / import compliance", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("CMO", "HPE CMO responsibilities", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Resource", "HPE or client resources", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("LoL", "Limits of Liability", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("OffshoreLocation", "No use of offshore locations", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Timeline", "Timelines and critical dates", true, false, '', ''));

    		self.initConstraintCount = constraintArr.length;
    		self.keyClientConstraint = ko.observableArray(constraintArr);
    		self.addRow = function () {
    		    self.keyClientConstraint.push(new self.constraintRow("Other", "", false, true, '', ''));
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
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        vm = {},
        sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getCostingApproach();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.costingReport != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
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
    				//alert(JSON.stringify(oppty));
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.costingReport != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
    						}
    						vm.section.data.content(temp);
    					}
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var costingApproach = data.solnOverview.costingReport.data.content;
    	//compare allOfferings with costingApproach in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var costingLength = costingApproach.length;
    	var offeringLength = allOffering.length;
    	var x, y;

    	if (offeringLength == 0) {
    		costingApproach = [];
    		costingLength = costingApproach.length;
    	}
    	if (costingLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < costingLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != costingApproach[y].offering) {
    				costingApproach.splice(y, 1);
    				costingLength = costingLength - 1;
    				y = x;
    			} else {
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = costingLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			costingApproach.push({ offering: allOffering[index].offering, xmoApproach: "", cmpyTarget: "" });
    		}
    	}
    	while (x < y) {
    	    costingApproach.splice(x, 1);
    	    y = y - 1;
    	}
    	vm.section.data.content(costingApproach);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0407') {
            return;
        }
        var temp = ko.toJS(vm.section.data);
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty'),
        TopLinkHome = require("./TopLinkHome"),
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
    }

    function createSDContentsViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var sdContentViewModel = function () {
            var self = this;
            self.opptyID = ko.observable();
            self.opptyName = ko.observable();
            self.sdLoaderUrl = appConfig.ENV.SectionLoaderUrl;
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
        jasnybs = require('jasnybs'),
        opptyModel = require('model/Oppty'),
        requestAPI = require('model/RequestAPI'),
        appConfig = require('model/AppConfig'),
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
        timeInterval = 0,
        saveCompleted = true,
        eTag = "",
        sectionModel = {},
        viewModel = {};

    function addSDLinkAfterAppHome() {
        appUtility.addSDLinkAfterAppHome();
    }

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
        $(window).on('submitableChanged', function (e, receiveData) {
            saveCompleted = receiveData.submitFlag;
            if (saveCompleted) {
                requestAPI.updateSection(receiveData.opptyID, receiveData.sectionName, receiveData.obj, receiveData.eTag).done(function (data, textStatus, jqXHR) {
                    if (jqXHR != undefined)
                        eTag = jqXHR.getResponseHeader('ETag');
                    requestAPI.errorUpdateSection(data, receiveData.sid, receiveData.opptyID);
                });
            }            
        });
    }

    function showMsg(event,data) {
        console.log(data);
    }

    function onViewModelPreLoad() {
        addSDLinkAfterAppHome();
        listenCustomEvent();

        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });
    }

    function loadingDocument() {

    }

    function onViewModelLoad(viewModel) {
        var sid = appUtility.getUrlParameter('sid');
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        viewModel.sid(sid);
        if (viewModel.opptyID() === "") {

        } else {
            viewModel.sectionNavigator(requestAPI.createSectionModel());
            viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
            retriveDocument(viewModel);
       }
    
    }

    function retriveDocument(viewModel) {
        requestAPI.getSectionByIDAndSectionNameSync(viewModel.opptyID(), viewModel.sectionName()).done(function (oppty, xhr) {
            //query system
            if (oppty.status != undefined && oppty.status >= 400) {
                requestAPI.errorOppty('404');
            } else {
                if (oppty.data.opptyOverview != null && oppty.data.opptyOverview.opptyData != null) {
                    var data = oppty.data.opptyOverview.opptyData.data;
                    viewModel.document(oppty.data);
                    viewModel.eTag(xhr.getResponseHeader('ETag'));
                    viewModel.oppty.ClientName(data.clientName);
                    viewModel.oppty.OpptyName(data.opptyName);
                    viewModel.pursuitClassfication(data.pursuitClassfication);
                    if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                        viewModel.involvedGbu('apps');
                        viewModel.appsInscope(data.involvedGbu.apps.inScope);
                    }
                    sectionModel = requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope());
                    viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));
                }
            }
        });
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionModel = requestAPI.createSectionModel('C', 'apps', true);
        var sectionViewModel = function (){
            var self = this;
            self.oppty = {
                ID: "",
                OpptyName: ko.observable(""),
                ClientName: ko.observable(""),
                pursuitClassfication : ko.observable()
            };

            self.document = ko.observable();// the entire document
            self.eTag = ko.observable();
            self.sectionName = ko.observable();
            self.sectionNavigator = ko.observable(requestAPI.createSectionModel('C', 'apps', true));//section navigator model

            self.opptyID = ko.observable();
            self.sdLoaderUrl = appConfig.ENV.SectionLoaderUrl;
            self.sdContentUrl = appConfig.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();

            self.editable = ko.observable(true);
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            self.sid = ko.observable();
            self.title = ko.observable();
            self.prevSid = ko.observable();
            self.nextSid = ko.observable();

            self.sid.subscribe(function (newSid){
                for (var i in self.sectionNavigator()) {
                    if (self.sectionNavigator()[i].sid === self.sid()) {
                        self.title(self.sectionNavigator()[i].title);
                        self.prevSid(self.sectionNavigator()[i].prevSid);
                        self.nextSid(self.sectionNavigator()[i].nextSid);
                        return;
                    }
                }
            });
            self.saveHome = function () {
                //$('[name="sd-save-section"]').attr('sd-sid', '00').click();                
            }
            self.save = function () {
                beforeSave();
                $(window).triggerHandler("opptySaving", self);                
                //afterSave(viewModel.sid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.saveAndNext = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        viewModel.sid('' + self.nextSid());                        
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }                    
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    viewModel.sid('' + self.nextSid());
                    $(window).triggerHandler("sectionChanged", viewModel);
                }
                //afterSave(viewModel.nextSid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.saveAndPrevious = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        viewModel.sid('' + self.prevSid());
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    viewModel.sid('' + self.prevSid());
                    $(window).triggerHandler("sectionChanged", viewModel);
                }
                //afterSave(viewModel.prevSid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.changeSection = function (sid) {
                beforeSave();
                $(window).triggerHandler("opptySaving", viewModel);
                viewModel.sid(sid);
                //afterSave(sid);
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
                $(window).triggerHandler("sectionChanged", viewModel);
            }
        },
        viewModel = new sectionViewModel();
        onViewModelLoad(viewModel);
        return viewModel;
    }

    function afterSave(sid) {
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
            section0407
        ]
    };
});