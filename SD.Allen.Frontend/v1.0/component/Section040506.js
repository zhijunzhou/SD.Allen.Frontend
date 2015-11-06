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
            getDeliveryResp();
        } else {
            var data = sectionLoaderViewModel.document();
            var solnOverview = data.solnOverview;
            if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.clientRetainedResp != null) {
                doDataBinding(data);
            }
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

    function getDeliveryResp() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.clientRetainedResp != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040506') {
            return;
        }
    	var newData = {};
    	var newDataArr = new Array;
    	for (var i in vm.data.content()) {
    	    newDataArr.push(new DeliveryResp(vm.data.content()[i]));
    	}
    	newData = { "content": newDataArr };
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, newData, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    	    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	    vm.section.eTag = jqXHR.getResponseHeader('ETag');
    	});
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