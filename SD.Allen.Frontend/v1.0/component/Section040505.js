/*global define, alert, console, location*/
define('component/Section040505', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
		select2 = require('select2'),
        templateHtml = require("text!./Section040505Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

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
    	    if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.svcDeliveryResp != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function deliveryResp(resp) {
    	var me = this;
    	me.offering = ko.observable(resp.offering);
    	me.delivery = ko.observable(resp.delivery);
    	me.otherBuDelivery = ko.observable(resp.otherBuDelivery);
    	me.specificBuDelivery = ko.observable(resp.specificBuDelivery);
    	me.partnerDelivery = ko.observable(resp.partnerDelivery);
    	me.thirdPartyDelivery = ko.observable(resp.thirdPartyDelivery);
    	me.comment = ko.observable(resp.comment);

    	me.index = vm.svcDeliveryResp().length;
    	me.loaded = ko.observable(true);
    	me.otherOptionVisible = ko.observable(false);
    	update(me.otherBuDelivery());

    	me.otherBuDelivery.subscribe(function (buDelivery) { me.updateSpecificBuDelivery(buDelivery); });
    	me.updateSpecificBuDelivery = function (buDelivery) {
    		me.loaded(false);
    		update(buDelivery);
    	}
    	function update(buDelivery) {
    		if (buDelivery == 'Other') {
    			me.otherOptionVisible(true);
    		} else {
    			me.otherOptionVisible(false);
    		}
    	}
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var svcDeliveryRespViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "service-delivery-responsibilities",
            	data: {
            		content: ko.observableArray([])
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.svcDeliveryResp = ko.observableArray([]);
        };
        vm = new svcDeliveryRespViewModel(params);
        onViewModelLoaded();
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
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.svcDeliveryResp != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					var temp = vm.section.data.content();
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
    						}
    						vm.section.data.content(temp);
    						for (var resp in temp) {
    						    vm.svcDeliveryResp.push(new deliveryResp(temp[resp]));
    						}
    					} else {

    					}
    				}
    			}
    		});
    	}
    }


    function doDataBinding(data) {
    	var svcDeliveryResp = unescapeContent(data.solnOverview.deliveryStrategies.svcDeliveryResp.data.content);
    	//compare allOfferings with svcDeliveryResp in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var respLength = svcDeliveryResp.length;
    	var offeringLength = allOffering.length;
    	var x, y;
    	if (offeringLength == 0) {
    		svcDeliveryResp = [];
    		respLength = svcDeliveryResp.length;
    	}

    	if (respLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < respLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != svcDeliveryResp[y].offering) {
    				svcDeliveryResp.splice(y, 1);
    				respLength = respLength - 1;
    				y = x;
    			} else {
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = respLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			svcDeliveryResp.push({ offering: allOffering[index].offering, delivery: "", otherBuDelivery: "",specificBuDelivery:"", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
    		}
    	}

    	while (x < y) {
    	    svcDeliveryResp.splice(x, 1);
    	    y = y - 1;
    	}

    	vm.section.data.content(svcDeliveryResp);
    	for (var resp in svcDeliveryResp) {
    		vm.svcDeliveryResp.push(new deliveryResp(svcDeliveryResp[resp]));
    	}
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040505') {
            return;
        }
        var svcDeliveryResp = doDataMapping();
        //alert(JSON.stringify(temp));
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, svcDeliveryResp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    function doDataMapping() {
    	var svcDeliveryResp = [];
    	for (var resp in vm.svcDeliveryResp()) {
    		svcDeliveryResp.push({ offering: vm.svcDeliveryResp()[resp].offering(), delivery: vm.svcDeliveryResp()[resp].delivery(), otherBuDelivery: vm.svcDeliveryResp()[resp].otherBuDelivery(), specificBuDelivery: vm.svcDeliveryResp()[resp].specificBuDelivery(), partnerDelivery: vm.svcDeliveryResp()[resp].partnerDelivery(), thirdPartyDelivery: vm.svcDeliveryResp()[resp].thirdPartyDelivery(), comment: vm.svcDeliveryResp()[resp].comment(), });
    	}
    	vm.section.data.content(svcDeliveryResp);
    	return escapeContent(ko.toJS(vm.section.data));
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].comment = escape(content[i].comment);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].comment = unescape(content[i].comment);
    	}
    	return content;
    }

    return {
        name: ["Section040505", "sd-section-040505"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});