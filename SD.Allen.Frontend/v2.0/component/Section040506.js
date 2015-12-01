/*global define, alert, console, location*/
define('component/Section040506', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040506Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function DeliveryResp(data) {
        if (data != null) {
            return {
                retainedService: data.retainedService,
                clientDelivery: data.clientDelivery == 1 ? true : false,
                clientPartnerDelivery: data.clientPartnerDelivery,
                clientThirdPartyDelivery: data.clientThirdPartyDelivery,
                comment:escape(data.comment)
            };
        }
        return {
            retainedService:"",
            clientDelivery: "",
            clientPartnerDelivery: "",
            clientThirdPartyDelivery: "",
            comment:""
        };
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
    	listenCustomEvent();
    	//pop-up tooltip           
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            //getDeliveryResp();
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.clientRetainedResp != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.clientRetainedResp != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionLoaderViewModel = params.viewModel;
        var clientRetainedRespViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "client-retained-responsibilities"
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.data = {
                content: ko.observableArray()
            };

            self.addRow = function () {
                self.data.content.push(new DeliveryResp());                
            };

            self.remove = function () {
                self.data.content.remove(this);
            };
        };
        vm = new clientRetainedRespViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        onViewModelLoaded(vm);
        return vm;
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040506') {
            return;
        }
    	var newDataArr = new Array;
    	for (var i in vm.data.content()) {
    	    newDataArr.push(new DeliveryResp(vm.data.content()[i]));
    	}
    	var temp = { "content": newDataArr };
    	requestAPI.unifiedSave(true, temp, argu);
    }

    function doDataBinding(data) {
        var clientRetainedResp = data.solnOverview.deliveryStrategies.clientRetainedResp.data.content;
        vm.data.content(unescapeData(clientRetainedResp));
    }

    function unescapeData(content) {
        for (var i in content) {            
    		content[i].comment = unescape(content[i].comment);
        }
        return content;
    }

    return {
        name: ["Section040506", "sd-section-040506"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});