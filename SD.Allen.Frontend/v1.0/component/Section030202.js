/*global define, alert, console, location*/
define('component/Section030202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
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
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function KeyCompetitor(data) {
        if (data != null) {
            return {
                name: data.name,
                strengthDetail: escape(data.strengthDetail),
                weaknessDetail: escape(data.weaknessDetail),
                advantageDetail: escape(data.advantageDetail)
            };
        }
        return {
            name: "",
            strengthDetail: "",
            weaknessDetail: "",
            advantageDetail: ""
        };
    }

    function unescapeData(data) {
        vm.data.competitorNum(data.competitorNum);
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                vm.data.content[i].name(data.content[i].name);
                vm.data.content[i].strengthDetail(unescape(data.content[i].strengthDetail));
                vm.data.content[i].weaknessDetail(unescape(data.content[i].weaknessDetail));
                vm.data.content[i].advantageDetail(unescape(data.content[i].advantageDetail));
            }
        }
    }

    function initKeyCompetitor(num) {
        for (var i = 0; i < num, i < 4; i++) {
            vm.data.content.push(new KeyCompetitor());
        }        
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
                        if (bizSoln != null && bizSoln.winStrategy!=null && bizSoln.winStrategy.competitors != null) {
                            var data = bizSoln.winStrategy.competitors.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                        } else {
                            //initKeyCompetitor(4);
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
        var competitorsViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "competitors",
            };
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
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.pursuitClassfication = sectionLoaderViewModel.pursuitClassfication();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
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

    function loadingSection() {
        if (sectionLoaderViewModel.editable()) {
            onViewModelLoaded(vm);
        } else {
            var doc = ko.toJS(sectionLoaderViewModel.document);
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.competitors != null)
                unescapeData(doc.bizSoln.winStrategy.competitors.data);
        }
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
            requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                if (jqXHR != undefined)
                    vm.section.eTag = jqXHR.getResponseHeader('ETag');
                requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
            });
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
