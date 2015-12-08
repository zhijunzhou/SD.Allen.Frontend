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
