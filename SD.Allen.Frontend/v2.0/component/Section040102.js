/*global define, alert, console, location*/
define('component/Section040102', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040102Template.html"),
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
    	    //getKeyScopeItem();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.keyScopeItem != null) {
    	        doDataBinding(data);
            }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.keyScopeItem != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	var keyScopeItem = unescapeContent(data.solnOverview.scope.keyScopeItem.data);
    	vm.section.data.keyScopeItemDetail(keyScopeItem.keyScopeItemDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040102') {
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
    	var keyScopeItemViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "key-scope-items",
    			data: {
    				keyScopeItemDetail: ko.observable()
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new keyScopeItemViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040102", "sd-section-040102"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});