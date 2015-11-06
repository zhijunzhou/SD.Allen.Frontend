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
        if (data != null) {
            return {
                clientRevenue : escape(data.clientRevenue()),
                clientRevenueYear: data.clientRevenueYear(),
                noBusinessUnits : data.noBusinessUnits(),
                inWhatCountries : data.inWhatCountries(),
                acctBizPlanImpactPointDetail : data.acctBizPlanImpactPointDetail(),
                explainImpact : escape(data.explainImpact()),
                priBizChlgDetail : escape(data.priBizChlgDetail()),
                clientCompellingEventDetail : escape(data.clientCompellingEventDetail()),
                curItStateDetail : escape(data.curItStateDetail()),
                keyDifferentiation : escape(data.keyDifferentiation()),
                buRelationDetail : escape(data.buRelationDetail()),
                hpiRelationDetail : escape(data.hpiRelationDetail()),
                clientFcnDetail : escape(data.clientFcnDetail()),
                clientDecisionCriteriaDetail : escape(data.clientDecisionCriteriaDetail()),
                clientProcApproach : data.clientProcApproach(),
                accountDeliveryMgmtDetail : escape(data.accountDeliveryMgmtDetail())
            };
        }
        return {
            clientRevenue: "",
            clientRevenueYear: "",
            noBusinessUnits: 1,
            inWhatCountries: [],
            acctBizPlanImpactPointDetail: "Yes",
            explainImpact: "",
            priBizChlgDetail: "",
            clientCompellingEventDetail: "",
            curItStateDetail: "",
            keyDifferentiation: "",
            buRelationDetail: "",
            hpiRelationDetail: "",
            clientFcnDetail: "",
            clientDecisionCriteriaDetail: "",
            clientProcApproach: "",
            accountDeliveryMgmtDetail: ""
        }
    }

    function unescapeData(data) {       
        //alert(new Date("Sep 9 2015").format("yyyy-MM-ddTHH:mm:ss"));
        vm.data.clientRevenue (unescape( data.clientRevenue));
        vm.data.clientRevenueYear(data.clientRevenueYear == null ? "" : data.clientRevenueYear);
        vm.data.noBusinessUnits ( data.noBusinessUnits);
        vm.data.inWhatCountries ( data.inWhatCountries);
        vm.data.acctBizPlanImpactPointDetail ( data.acctBizPlanImpactPointDetail);
        vm.data.explainImpact (unescape( data.explainImpact));
        vm.data.priBizChlgDetail (unescape( data.priBizChlgDetail));
        vm.data.clientCompellingEventDetail (unescape( data.clientCompellingEventDetail));
        vm.data.curItStateDetail (unescape( data.curItStateDetail));
        vm.data.keyDifferentiation (unescape( data.keyDifferentiation));
        vm.data.buRelationDetail (unescape( data.buRelationDetail));
        vm.data.hpiRelationDetail (unescape( data.hpiRelationDetail));
        vm.data.clientFcnDetail (unescape( data.clientFcnDetail));
        vm.data.clientDecisionCriteriaDetail (unescape( data.clientDecisionCriteriaDetail));
        vm.data.clientProcApproach ( data.clientProcApproach);
        vm.data.accountDeliveryMgmtDetail(unescape(data.accountDeliveryMgmtDetail));
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
                        if (bizSoln != null && bizSoln.clientOverview != null) {
                            var data = bizSoln.clientOverview.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                            vm.section.loaded(true);
                            vm.selectedCnty(extractCntry($('#inWhatCountries').select2('data')));
                        } else {
                            //other processing
                        }
                    }
                    return this.promise();
                }
            })
        }        
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
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "client-overview",
                loaded: ko.observable(false)
            };
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            
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
                accountDeliveryMgmtDetail : ko.observable()  
            };

            //select2
            $('#inWhatCountries').select2({ tags: true });
            self.selectedCnty = ko.observable();

            self.save = function () {
                saveOppty();
            }
        };
        vm = new clientOverViewModel(params);
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
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.clientOverview != null)
                unescapeData(doc.bizSoln.clientOverview.data);
        }
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0301') {
            return;
        }
        var newData = new ClientOverview(vm.data);
        requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
            if (jqXHR != undefined)
                vm.section.eTag = jqXHR.getResponseHeader('ETag');
            requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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