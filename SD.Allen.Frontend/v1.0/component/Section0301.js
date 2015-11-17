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