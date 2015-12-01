/*global define, alert, console, location*/
define('component/Section040305', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040305Template.html"),
		requestAPI = require('model/RequestAPI'),
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

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getDesignParam();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.designParam != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.designParam != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var designParam = unescapeContent(data.solnOverview.solnApproach.designParam.data);
    	vm.section.data.solnParamDetail(designParam.solnParamDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040305') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var p in content) {
    		content[p] = escape(content[p]);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var p in content) {
    		content[p] = unescape(content[p]);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var designParamViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "design-params",//section name 
    			data: {
    				solnParamDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new designParamViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040305", "sd-section-040305"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});