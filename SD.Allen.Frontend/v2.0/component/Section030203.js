define('component/Section030203', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./Section030203Template.html"),
        vm = {},
        sectionLoaderViewModel = {};

    function MapValProp(data) {
        if (data != null) {
            this.clientBizDetail = data.clientBizDetail;
            this.chlgImpactDetail = setEscapeValue(data.chlgImpactDetail);
            this.capabilityDetail = setEscapeValue(data.capabilityDetail);
            this.evidenceDetail = setEscapeValue(data.evidenceDetail);
        } else {
            this.clientBizDetail = "";
            this.chlgImpactDetail = "";
            this.capabilityDetail = "";
            this.evidenceDetail = "";
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
        if (data.content != null && data.content.length > 0) {
            for (var i in data.content) {
                data.content[i].clientBizDetail = getUnEscapeValue(data.content[i].clientBizDetail);
                data.content[i].chlgImpactDetail = getUnEscapeValue(data.content[i].chlgImpactDetail);
                data.content[i].capabilityDetail = getUnEscapeValue(data.content[i].capabilityDetail);
                data.content[i].evidenceDetail = getUnEscapeValue(data.content[i].evidenceDetail);
            } 
        } else {
            data.content.push(new MapValProp(null));
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
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
        listenCustomEvent();
    }

    function onViewModelLoaded() {
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var mapValPropViewModel = function () {
            var self = this;
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
        };
        vm = new mapValPropViewModel(params);
        loadSection();
        return vm;
    }

    function loadSection(newViewModel) {
        if (newViewModel) {
            sectionLoaderViewModel = newViewModel;
        }
        vm.editable(sectionLoaderViewModel.editable());
        var doc = ko.toJS(sectionLoaderViewModel.document);
        if (doc != undefined && doc.bizSoln != null && doc.bizSoln.winStrategy != null && doc.bizSoln.winStrategy.mapValProps != null) {
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
            requestAPI.unifiedSave(true, newData, argu);
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
