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
