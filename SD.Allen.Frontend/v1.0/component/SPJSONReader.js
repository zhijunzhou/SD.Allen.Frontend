define(function (require) {
    "use strict";
    var $ = require("jquery"),
        appConfig = require('model/AppConfig'),
        sdCoreUrl = appConfig.ENV.siteAbsoluteUrl + "/_api/web/Lists/getbytitle('SD%20Core')",
        opptyListUrl = sdCoreUrl + "/items";

    function getMyOpptyAsync(params) {
        var oppties;
        var dfd = $.Deferred();
        $.ajax({
            url: opptyListUrl + "?$select=Title,OpptyID,OpptyName,ClientName,DealStatus,SalesStage",
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
    }

    function getAllOpptyAsync(params) {
        var oppties;
        var dfd = $.Deferred();
        $.ajax({
            url: opptyListUrl + "?$select=OpptyID,OpptyName,ClientName",
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
    }

    function getDataByOpptyID(opptyID) {
        var dfd = $.Deferred();
        var opptyUrl = opptyListUrl + "?$filter=OpptyID eq " + "'" + opptyID + "'";
        $.ajax({
            url: opptyUrl,
            type: "get",
            dataType: "JSON",
            headers: {
                "accept": "application/JSON;odata=verbose",
                "content-type": "application/JSON;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var opptyData = data.d.results;
                if (opptyData.length == 0) {
                    dfd.resolve();
                }else{
                    dfd.resolve(opptyData[0]);
                }
            },
            async: true
        });
        return dfd.promise();
    }

    function saveDataByItemID(oppty) {
        var dfd = $.Deferred();
        var opptyUrl = opptyListUrl + "(" + oppty.itemID() + ")";
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'JSON':'{0}'}}", JSON.stringify(oppty.JSON()));
        $.ajax({
            url: opptyUrl,
            method: "post",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            },
            success: function (data) {
                dfd.resolve(data);
            }
        });
        return dfd.promise();
    }

    function saveDataByOpptyID(opptyID, updatedData) {
        var opptyUrl = opptyListUrl + "(" + index + ")";
        var dfd = $.Deferred();
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'Title':'{0}','OpptyID':'{1}','JSON':'{2}'}}", opptyID, opptyID, JSON.stringify(updatedData));
        $.ajax({
            url: opptyUrl,
            method: "post",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            },
            success: function (data) {
                dfd.resolve(data);
             }
        });
         return dfd.promise();
    }

    function addOppty(params, title, opptyID, opptyName, clientName, dealStatus, salesStage, jsonData) {
        var dfd = $.Deferred();
        var body = String.format("{{'__metadata':{{'type':'SP.Data.CoreListItem'}},'Title':'{0}','OpptyID':'{1}','OpptyName':'{2}','ClientName':'{3}','DealStatus':'{4}','SalesStage':'{5}','JSON':'{6}'}}", title, opptyID, opptyName, clientName, dealStatus, salesStage, JSON.stringify(jsonData));
        $.ajax({
            url: opptyListUrl,
            method: "post",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "X-HTTP-Method": "PUT"
            },
            success: function (data) {
                dfd.resolve(data);
            }
        });
        return dfd.promise();
    }

    //function opptyOverviewData(opptyID, opptyName, salesStage, opptyType, dealStatus, clientName, leadBizUnit, apps, bps, ito, hpeOther,contractTerm, contractSignDate, leadHPECntry, clientCntry,region,productLine) {
    //    this.opptyID = opptyID;
    //    this.opptyName = opptyName;
    //    this.salesStage = salesStage;
    //    //;
    //    this.opptyType = opptyType;
    //    this.dealStatus = dealStatus;
    //    this.clientName = clientName;
    //    this.leadBizUnit = leadBizUnit;
    //    this.apps = apps;
    //    this.bps = bps;
    //    this.ito = ito;
    //    this.hpeOther = hpeOther;
    //    this.contractTerm = contractTerm;
    //    this.contractSignDate = contractSignDate;
    //    this.leadHPECntry = leadHPECntry;
    //    this.clientCntry = clientCntry;
    //    //;
    //    this.region = region;

    //    this.productLine = productLine;
    //}

    function opptyOverview(oppty,productLine) {
        this.opptyID = oppty.OpportunityID;
        this.opptyName = oppty.OpportunityName;
        this.salesStage = oppty.CurrentSalesStage;
        //;
        this.opptyType = oppty.OpportunityType;
        this.dealStatus = oppty.OpportunityStatus;
        this.clientName = oppty.CustomerAMID4Name;
        this.leadBizUnit = oppty.PrimaryGBU;
        this.apps = oppty.APPSUSD;
        this.bps = oppty.BPOUSD;
        this.ito = oppty.ITOUSD;
        this.hpeOther = oppty.HPESOtherUSD;
        this.contractTerm = oppty.ContractLengthinMonths;
        this.contractSignDate = oppty.SignDate;
        this.leadHPECntry = oppty.ESRegion;
        this.clientCntry = oppty.CRPRegionName;
        //;
        this.region = oppty.ESGeo;

        this.productLine = productLine;
    }

    function subProductLine(subProductLine) {
        this.serviceLine = subProductLine.LineItemProductLineName;
        this.offering = subProductLine.LineItemSubProductLineName;
    }

    //  using sample:
    //   dataReader = require('component/SPJSONReader'),
    //  dataReader.getProductLineAsync().done(function (opptyOverview) {
    //    //operate opptyOverview;
    //  });
    function getProductLineAsync() {
        var url = appConfig.WebAPI.HRSoln;
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
                        productLine.push(new subProductLine(temp[i]));
                    }
                    opptyOverviewData = new opptyOverview(oppty, productLine);
                    dfd.resolve(opptyOverviewData);
                }
            },
            async: true
        });
        return dfd.promise();
    }
      
    return {
        getDataByOpptyID: getDataByOpptyID,
        saveDataByOpptyID: saveDataByOpptyID,
        saveDataByItemID: saveDataByItemID,
        addOppty: addOppty,
        getMyOpptyAsync: getMyOpptyAsync,
        getAllOpptyAsync: getAllOpptyAsync,
        opptyOverview: opptyOverview,
        getProductLineAsync: getProductLineAsync
    };
});