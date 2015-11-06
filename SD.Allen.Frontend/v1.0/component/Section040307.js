/*global define, alert, console, location*/
define('component/Section040307', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040307Template.html"),
		requestAPI = require('model/RequestAPI'),
        attachmentManager = require('./AttachmentManager'),
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
    		getAdditionalInfo();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.additionalInfo != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var additionalInfoViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "additional-info",
            	data: {
            	    explainDetail: ko.observable(""),
            	    attachment: ko.observableArray()
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
        };
        vm = new additionalInfoViewModel(params);
        onViewModelLoaded();
        return vm;
    }


    function getAdditionalInfo() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.additionalInfo != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    				    //init attachment with empty array;
    				    vm.section.data.attachment([]);
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var additionalInfo = unescapeContent(data.solnOverview.solnApproach.additionalInfo.data);
    	vm.section.data.explainDetail(additionalInfo.explainDetail);
    	vm.section.data.attachment(additionalInfo.attachment);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040307') {
            return;
        }

    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    function escapeContent(content) {
        content.explainDetail = escape(content.explainDetail);
        for (var p in content.attachment) {
            content.attachment[p].link = escape(content.attachment[p].link);
        }
    	return content;
    }

    function unescapeContent(content) {
        content.explainDetail = unescape(content.explainDetail);
        if (content.attachment != null) {
            for (var p in content.attachment) {
                content.attachment[p].link = unescape(content.attachment[p].link);
            }
        } else {
            content.attachment = [];
        }
    	return content;
    }

    return {
        name: ["Section040307", "sd-section-040307"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };

});