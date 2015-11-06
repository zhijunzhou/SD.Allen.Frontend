/*global define, alert, console, location*/
define('component/Section0407', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0407Template.html"),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        vm = {},
        sectionLoaderViewModel = {};

    function listenCustomEvent() {
    	$(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getCostingApproach();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.costingReport != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var costingReportViewModel = function () {
            var self = this;
            self.section = {
            	opptyID: "",
            	eTag: "",
            	name: "costing-reports",
            	data: {
            		content: ko.observable([])
            	}
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
        };
        vm = new costingReportViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function getCostingApproach() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				//alert(JSON.stringify(oppty));
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.costingReport != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
    						}
    						vm.section.data.content(temp);
    					}
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var costingApproach = data.solnOverview.costingReport.data.content;
    	//compare allOfferings with costingApproach in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var costingLength = costingApproach.length;
    	var offeringLength = allOffering.length;
    	var x, y;

    	if (offeringLength == 0) {
    		costingApproach = [];
    		costingLength = costingApproach.length;
    	}
    	if (costingLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < costingLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != costingApproach[y].offering) {
    				costingApproach.splice(y, 1);
    				costingLength = costingLength - 1;
    				y = x;
    			} else {
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = costingLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			costingApproach.push({ offering: allOffering[index].offering, xmoApproach: "", cmpyTarget: "" });
    		}
    	}
    	while (x < y) {
    	    costingApproach.splice(x, 1);
    	    y = y - 1;
    	}
    	vm.section.data.content(costingApproach);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0407') {
            return;
        }
        var temp = ko.toJS(vm.section.data);
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
    }

    return {
        name: ["Section0407", "sd-section-0407"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});