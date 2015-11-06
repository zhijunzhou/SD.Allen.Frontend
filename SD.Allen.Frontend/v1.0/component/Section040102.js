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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getKeyScopeItem();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.keyScopeItem != null) {
    	        doDataBinding(data);
            }
    	}
    }

    function getKeyScopeItem() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.keyScopeItem != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
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
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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