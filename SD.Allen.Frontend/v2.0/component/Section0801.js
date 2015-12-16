﻿define('component/Section0801', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./Section0801Template.html"),
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

    function KeyAssumption(data) {
        if (data != null) {
            this.offeringFuncArea = ko.observable(data.offeringFuncArea);
            this.assumption = ko.observable(data.assumption);
            this.planToClose = ko.observable(data.planToClose);
        } else {
            this.offeringFuncArea = ko.observable("");
            this.assumption = ko.observable("");
            this.planToClose = ko.observable("");
        }
    }

    function unescapeData(data) {
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].offeringFuncArea = getUnEscapeValue(data.content[i].offeringFuncArea);
                data.content[i].assumption = getUnEscapeValue(data.content[i].assumption);
                data.content[i].planToClose = getUnEscapeValue(data.content[i].planToClose);
            }
        } else {
            data.content.push(new KeyAssumption(null));
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
        var keyAssumptionViewModel = function () {
            var self = this;
            self.editable = ko.observable(true);
            self.data = {
                content: ko.observableArray([new KeyAssumption(null)])
            }
            self.addRow = function () {
                self.data.content.push(new KeyAssumption(null));
            };
            self.remove = function () {
                self.data.content.remove(this);
            }
        };
        vm = new keyAssumptionViewModel(params);
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
        if (data != undefined && data.keyAssumptions != undefined && data.keyAssumptions.content != undefined)
            unescapeData(data.keyAssumptions);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0801') {
            return;
        } else {
            var sectionName = "keyAssumptions";
            var newData = ko.toJS(vm.data);
            var content = { "keyAssumptions": newData };
            // save TODO
            // window.localStorage.setItem(sectionLoaderViewModel.opptyID(), JSON.stringify(content));
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
        name: ["Section0801", "sd-section-0801"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});