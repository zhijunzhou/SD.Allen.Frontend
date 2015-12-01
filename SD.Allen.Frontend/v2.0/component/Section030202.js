/*global define, alert, console, location*/
define('component/Section030202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030202Template.html"),
        vm = {},
        sectionLoaderViewModel = {};
    
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

    function setEscapeValue(val) {
        return (val === undefined || val === null) ? null : escape(val);
    }

    function getUnEscapeValue(val) {
        if (val != undefined && val != null) return unescape(val);
        return null;
    }

    function KeyCompetitor(data) {
        if (data != null) {
            this.name = data.name;
            this.strengthDetail = setEscapeValue(data.strengthDetail);
            this.weaknessDetail = setEscapeValue(data.weaknessDetail);
            this.advantageDetail = setEscapeValue(data.advantageDetail)
        }
    }

    function unescapeData(data) {
        vm.data.competitorNum(data.competitorNum);
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                vm.data.content[i].name(data.content[i].name);
                vm.data.content[i].strengthDetail(getUnEscapeValue(data.content[i].strengthDetail));
                vm.data.content[i].weaknessDetail(getUnEscapeValue(data.content[i].weaknessDetail));
                vm.data.content[i].advantageDetail(getUnEscapeValue(data.content[i].advantageDetail));
            }
        }
    }

    function initKeyCompetitor(num) {
        for (var i = 0; i < num, i < 4; i++) {
            vm.data.content.push(new KeyCompetitor());
        }        
    }

    function onViewModelLoaded() {
        
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var competitorsViewModel = function () {
            var self = this;
            self.pursuitClassfication = ko.observable();
            self.editable = ko.observable(true);
            self.data = {
                competitorNum : ko.observable(1),
                content: [
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail:ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    },
                    {
                        name: ko.observable(''),
                        strengthDetail: ko.observable(''),
                        weaknessDetail: ko.observable(''),
                        advantageDetail: ko.observable('')
                    }
                ]
            };

            self.isInteger = ko.observable(true);
            //subscrbe
            self.data.competitorNum.subscribe(checkNum);
            
            $(".popover-options a").popover({ html: true });
            $('.popover-show').popover('show');

            self.save = function () {
                if(checkNum(self.data.competitorNum()))
                    saveOppty();
            }

        };
        vm = new competitorsViewModel(params);
        loadSection();
        return vm;
    }

    function checkNum(inputText) {
        var reg = /^\+?(0|[1-9]\d*)$/;
        if (reg.test(inputText)) {
            //is integer
            vm.isInteger(true); return true;
        } else {
            //not integer
            vm.isInteger(false); return false;
        }
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.competitors != null)
            unescapeData(doc.bizSoln.winStrategy.competitors.data);
        
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030202') {
            return;
        } else {
            var newData = ko.toJS(vm.data);
            for (var i in newData.content) {
                newData.content[i] = new KeyCompetitor(newData.content[i]);
            }
            requestAPI.unifiedSave(true, newData, argu);
        }
        
    }

    return {
        name: ["Section030202", "sd-section-030202"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        },        
        subComponents: [inputText]
    };
   
});
