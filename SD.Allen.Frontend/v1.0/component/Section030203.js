define('component/Section030203', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030203Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function MapValProp(data) {
        if (data != null) {
            return {
                clientBizDetail: data.clientBizDetail,
                chlgImpactDetail: escape(data.chlgImpactDetail),
                capabilityDetail: escape(data.capabilityDetail),
                evidenceDetail: escape(data.evidenceDetail)
            };
        }
        return {
            clientBizDetail: "",
            chlgImpactDetail: "",
            capabilityDetail: "",
            evidenceDetail: ""
        };
    }
       
    //before binding, we should unescape the original data from DB
    function unescapeData(data) {
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].clientBizDetail = unescape(data.content[i].clientBizDetail);
                data.content[i].chlgImpactDetail = unescape(data.content[i].chlgImpactDetail);
                data.content[i].capabilityDetail = unescape(data.content[i].capabilityDetail);
                data.content[i].evidenceDetail = unescape(data.content[i].evidenceDetail);
            } 
        } else {
            data.content.push(new MapValProp(null));
        }        
        vm.data.content(data.content);
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
                    if (oppty.data.bizSoln != null) {
                        var bizSoln = oppty.data.bizSoln;
                        if (bizSoln != null && bizSoln.winStrategy != null && bizSoln.winStrategy.mapValProps != null) {
                            var data = bizSoln.winStrategy.mapValProps.data;
                            vm.section.eTag = xhr.getResponseHeader('ETag');
                            unescapeData(data);
                        } else {

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
        var mapValPropViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                sectionName: "map-value-propositions",
            };

            self.data = {
                content : ko.observableArray()
            };
            self.editable = ko.observable(true);
            self.addRow = function () {
                self.data.content.push(new MapValProp());
            };
            self.remove = function () {
                self.data.content.remove(this);
            }           
            
            self.save = function () {
                saveOppty();
            }
        };
        vm = new mapValPropViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.editable(sectionLoaderViewModel.editable());
        loadingSection();
        return vm;
    }

    function loadingSection() {
        if (sectionLoaderViewModel.editable()) {
            onViewModelLoaded(vm);
        } else {
            var doc = ko.toJS(sectionLoaderViewModel.document);
            if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.mapValProps != null)
                unescapeData(doc.bizSoln.winStrategy.mapValProps.data);
        }
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '030203') {
            return;
        } else {
            var newData = ko.toJS(vm.data);
            for (var i in newData.content) {
                newData.content[i] = new MapValProp(newData.content[i]);
            }
            requestAPI.updateSection(vm.section.opptyID, vm.section.sectionName, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
                if (jqXHR != undefined)
                    vm.section.eTag = jqXHR.getResponseHeader('ETag');
                requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
            });
        }
       
    }

    return {
        name: ["Section030203", "sd-section-030203"],
        template: templateHtml,        
        viewModel: {
            createViewModel: createViewModel            
        }
    };
   
});
