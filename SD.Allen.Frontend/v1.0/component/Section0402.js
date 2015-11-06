/*global define, alert, console, location*/
define('component/Section0402', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0402Template.html"),
		requestAPI = require('model/RequestAPI'),
        appConfig = require('model/AppConfig'),
        attachmentManager = require('./AttachmentManager'),
        appUtility = require('util/AppUtility'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }
    function updateAttachments(data) {
        console.log(vm.section.data.attachment());
    }
    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getClientArch();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.clientArch != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getClientArch() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.clientArch != null) {
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
        var clientArch = unescapeContent(data.solnOverview.clientArch.data);
    	vm.section.data.keyComponentDetail(clientArch.keyComponentDetail);
    	vm.section.data.painAreaDetail(clientArch.painAreaDetail);
    	vm.section.data.keyTechDriverDetail(clientArch.keyTechDriverDetail);
    	vm.section.data.bizCriticalAreaDetail(clientArch.bizCriticalAreaDetail);
    	vm.section.data.serviceCollaborationDetail(clientArch.serviceCollaborationDetail);
    	vm.section.data.integrationNeedDetail(clientArch.integrationNeedDetail);
    	vm.section.data.archPrincipleDetail(clientArch.archPrincipleDetail);
    	vm.section.data.archPrincipleConflictDetail(clientArch.archPrincipleConflictDetail);
    	vm.section.data.attachment(clientArch.attachment);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0402') {
            return;
        }
    	var temp = escapeContent(ko.toJS(vm.section.data));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    function escapeContent(content) {
        content.keyComponentDetail = escape(content.keyComponentDetail);
        content.painAreaDetail = escape(content.painAreaDetail);
        content.keyTechDriverDetail = escape(content.keyTechDriverDetail);
        content.bizCriticalAreaDetail = escape(content.bizCriticalAreaDetail);
        content.serviceCollaborationDetail = escape(content.serviceCollaborationDetail);
        content.integrationNeedDetail = escape(content.integrationNeedDetail);
        content.archPrincipleDetail = escape(content.archPrincipleDetail);
        content.archPrincipleConflictDetail = escape(content.archPrincipleConflictDetail);
        for (var p in content.attachment) {
            content.attachment[p].link = escape(content.attachment[p].link);
        }
    	return content;
    }

    function unescapeContent(content) {
        content.keyComponentDetail = unescape(content.keyComponentDetail);
        content.painAreaDetail = unescape(content.painAreaDetail);
        content.keyTechDriverDetail = unescape(content.keyTechDriverDetail);
        content.bizCriticalAreaDetail = unescape(content.bizCriticalAreaDetail);
        content.serviceCollaborationDetail = unescape(content.serviceCollaborationDetail);
        content.integrationNeedDetail = unescape(content.integrationNeedDetail);
        content.archPrincipleDetail = unescape(content.archPrincipleDetail);
        content.archPrincipleConflictDetail = unescape(content.archPrincipleConflictDetail);
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
    	var clientArchViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "client-architecture",//section name 
    			data: {
    				keyComponentDetail: ko.observable(),
    				painAreaDetail: ko.observable(),
    				keyTechDriverDetail: ko.observable(),
    				bizCriticalAreaDetail: ko.observable(),
    				serviceCollaborationDetail: ko.observable(),
    				integrationNeedDetail: ko.observable(),
    				archPrincipleDetail: ko.observable(),
    				archPrincipleConflictDetail: ko.observable(),
    				attachment: ko.observableArray()
    			},
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new clientArchViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0402", "sd-section-0402"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [attachmentManager]
    };
});