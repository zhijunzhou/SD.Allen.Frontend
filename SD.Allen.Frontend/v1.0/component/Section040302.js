/*global define, alert, console, location*/
define('component/Section040302', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040302Template.html"),
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
    		getOutSourcing();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.xmo != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getOutSourcing(viewModel) {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.xmo != null) {
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
        var xmo = unescapeContent(data.solnOverview.solnApproach.xmo.data);
        vm.section.data.attachment(xmo.attachment);
    	vm.section.data.cmoDetail(xmo.cmoDetail);
    	vm.section.data.tmoDetail(xmo.tmoDetail);
    	vm.section.data.fmoDetail(xmo.fmoDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040302') {
            return;
        }
    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }
    function escapeContent(content) {
		content.cmoDetail = escape(content.cmoDetail);
    	content.tmoDetail = escape(content.tmoDetail);
		content.fmoDetail = escape(content.fmoDetail);
		for (var p in content.attachment) {
			content.attachment[p].link = escape(content.attachment[p].link);
    	}
    	return content;
    }

    function unescapeContent(content) {
		content.cmoDetail = unescape(content.cmoDetail);
    	content.tmoDetail = unescape(content.tmoDetail);
    	content.fmoDetail = unescape(content.fmoDetail);
    	if (content.attachment != null) {
    	    for (var p in content.attachment) {
    	        content.attachment[p].link = unescape(content.attachment[p].link);
    	    }
    	} else {
    	    content.attachment = [];
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var outSourcingViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "xmo",//section name 
    			data: {
    				attachment: ko.observableArray([]),
    				cmoDetail: ko.observable(""),
    				tmoDetail: ko.observable(""),
    				fmoDetail: ko.observable(""),
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.attachmentSelected = function (e) {
    			insertAttachment(self);
    		};
    	};
    	vm = new outSourcingViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040302", "sd-section-040302"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };

});