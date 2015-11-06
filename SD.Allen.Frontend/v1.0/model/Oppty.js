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