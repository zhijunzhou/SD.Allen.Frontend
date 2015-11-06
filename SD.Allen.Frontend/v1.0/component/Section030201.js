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
        if (data != null) {
            return {
                salesStrategyDetail:escape(data.salesStrategyDetail()),
                clientTransformationStrategyDetail:escape(data.clientTransformationStrategyDetail()),
                dealBenefitDetail:escape(data.dealBenefitDetail()),
                criticalSuccessFactorDetail:escape(data.criticalSuccessFactorDetail()),
                dealEssentialDetail:escape(data.dealEssentialDetail()),
                sumryRelationStrategyDetail:escape(data.sumryRelationStrategyDetail()),
                specificSolnRqmtDetail:escape(data.specificSolnRqmtDetail()),
                supporterDetractorDetail:escape(data.supporterDetractorDetail()),
                bizPartnerDetail:escape(data.bizPartnerDetail())
            };
        }
        return {
            salesStrategyDetail: "",
            clientTransformationStrategyDetail: "",
            dealBenefitDetail: "",
            criticalSuccessFactorDetail: "",
            dealEssentialDetail: "",
            sumryRelationStrategyDetail: "",
            specificSolnRqmtDetail: "",
            supporterDetractorDetail: "",
            bizPartnerDetail: ""
        };
    }
    
    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
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
                        if (bizSoln != null && bizSoln.winStrategy !=null  && bizSoln.winStrategy.salesApproach != null) {
                            var data = bizSoln.winStrategy.salesApproach.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                            vm.section.loaded(true);
                        } else {
                            //other processing
                        }
                    }
                    return this.promise();
                }
            });
        }
    }

    //before binding, we should unescape the original data from DB
    function unescapeData(data) {
        vm.data.salesStrategyDetail(data.salesStrategyDetail != undefined ? unescape(data.salesStrategyDetail) : "");
        vm.data.clientTransformationStrategyDetail(data.clientTransformationStrategyDetail != null ? unescape(data.clientTransformationStrategyDetail) : "");
        vm.data.dealBenefitDetail(data.dealBenefitDetail != undefined ? unescape(data.dealBenefitDetail) : "");
        vm.data.criticalSuccessFactorDetail(data.criticalSuccessFactorDetail != undefined ? unescape(data.criticalSuccessFactorDetail) : "");
        vm.data.dealEssentialDetail(data.dealEssentialDetail != undefined ? unescape(data.dealEssentialDetail) : "");
        vm.data.sumryRelationStrategyDetail(data.sumryRelationStrategyDetail != null ? unescape(data.sumryRelationStrategyDetail) : "");
        vm.data.specificSolnRqmtDetail(data.specificSolnRqmtDetail != undefined ? unescape(data.specificSolnRqmtDetail) : "");
        vm.data.supporterDetractorDetail(data.supporterDetractorDetail != undefined ? unescape(data.supporterDetractorDetail) : "");
        vm.data.bizPartnerDetail(data.bizPartnerDetail != undefined ? unescape(data.bizPartnerDetail):"");
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var salesApprViewModel = function (json) {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "sales-approach",
                loaded: ko.observable(false)
            };
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
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.salesApproach != null)
                unescapeData(doc.bizSoln.winStrategy.salesApproach.data);
        }
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030201') {
            return;
        }
        var newData = new SalesApproach(vm.data);
        requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
            if (jqXHR != undefined)
                vm.section.eTag = jqXHR.getResponseHeader('ETag');
            requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
