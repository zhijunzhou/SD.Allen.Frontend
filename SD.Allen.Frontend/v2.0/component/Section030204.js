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
