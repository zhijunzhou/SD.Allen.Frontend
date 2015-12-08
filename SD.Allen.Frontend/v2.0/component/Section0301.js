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