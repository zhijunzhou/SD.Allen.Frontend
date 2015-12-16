define('component/Section0802', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./Section0802Template.html"),
        requestAPI = require('model/RequestAPI'),
        vm = {},
        sectionLoaderViewModel = {};

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function KeyDeliveryRisks(data) {
        if (data != null) {
            this.offeringFuncArea = ko.observable(data.offeringFuncArea);
            this.riskDescription = ko.observable(data.riskDescription);
            this.mitigationPlan = ko.observable(data.mitigationPlan);
            this.status = ko.observable(data.status);
        } else {
            this.offeringFuncArea = ko.observable("");
            this.riskDescription = ko.observable("");
            this.mitigationPlan = ko.observable("");
            this.status = ko.observable("Red");
        }
    }

    function unescapeData(data) {
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].offeringFuncArea = getUnEscapeValue(data.content[i].offeringFuncArea);
                data.content[i].riskDescription = getUnEscapeValue(data.content[i].riskDescription);
                data.content[i].mitigationPlan = getUnEscapeValue(data.content[i].mitigationPlan);
                data.content[i].status = getUnEscapeValue(data.content[i].status);
            }
        } else {
            data.content.push(new KeyDeliveryRisks(null));
        }
        vm.data.content(data.content);
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

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var keyDeliveryRisksViewModel = function () {
            var self = this;
            self.editable = ko.observable(true);
            self.data = {
                content: ko.observableArray([new KeyDeliveryRisks(null)])
            }
            self.addRow = function () {
                self.data.content.push(new KeyDeliveryRisks(null));
            };
            self.remove = function () {
                self.data.content.remove(this);
            }
        };
        vm = new keyDeliveryRisksViewModel(params);
        loadSection();
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.editable(sectionLoaderViewModel.editable());
        // retrieve TODO
        var data = JSON.parse(window.localStorage.getItem(sectionLoaderViewModel.opptyID()));
        if (data != undefined && data.keyDeliveryRisks != undefined && data.keyDeliveryRisks.content != undefined)
            unescapeData(data.keyDeliveryRisks);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0802') {
            return;
        } else {
            var sectionName = "keyDeliveryRisks";
            var newData = ko.toJS(vm.data);
            var content = { "keyDeliveryRisks": newData };
            // save TODO
            //window.localStorage.setItem(sectionLoaderViewModel.opptyID(), JSON.stringify(content));
            var data = JSON.parse(localStorage.getItem(sectionLoaderViewModel.opptyID()));
            if (data != undefined) { 
                data[sectionName] = newData;
            } else {
                data = content;
            }
            window.localStorage.setItem(sectionLoaderViewModel.opptyID(), JSON.stringify(data));
            
        }
    }

    return {
        name: ["Section0802", "sd-section-0802"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});