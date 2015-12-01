/*global define, alert, console, location*/
define('component/Section040306', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040306Template.html"),
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
    	    //getDeployStrategy();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.deployStrategy != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.deployStrategy != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var deployStrategy = unescapeContent(data.solnOverview.solnApproach.deployStrategy.data);
    	vm.section.data.initialThoughtDetail(deployStrategy.initialThoughtDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040306') {
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
    	var deployStrategyViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "deploy-strategy",//section name 
    			data: {
    				initialThoughtDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new deployStrategyViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040306", "sd-section-040306"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});