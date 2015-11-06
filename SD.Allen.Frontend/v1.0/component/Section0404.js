/*global define, alert, console, location*/
define('component/Section0404', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0404Template.html"),
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
    		getInnovativeAspect();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.innovativeAspect != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getInnovativeAspect() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.innovativeAspect != null) {
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
    	var innovativeAspect = unescapeContent(data.solnOverview.innovativeAspect.data);
    	vm.section.data.innovativeElementDetail(innovativeAspect.innovativeElementDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0404') {
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
    	var innovativeAspectViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "innovative-aspects",
    			data: {
    				innovativeElementDetail: ko.observable("")
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new innovativeAspectViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0404", "sd-section-0404"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});