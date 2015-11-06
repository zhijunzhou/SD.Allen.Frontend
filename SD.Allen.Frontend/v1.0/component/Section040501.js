/*global define, alert, console, location*/
define('component/Section040501', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040501Template.html"),
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
    		getLocationTarget();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.locationTarget != null) {
    	        if (solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function getLocationTarget() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.deliveryStrategies != null && solnOverview.deliveryStrategies.locationTarget != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    							temp.push({ offering: allOffering[k].offering, clientVolume: allOffering[k].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
    						}
    						vm.section.data.content(temp);
    					}
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	var locationTarget = data.solnOverview.deliveryStrategies.locationTarget.data.content;
    	//compare allOfferings with  locationTarget in the offering field;
    	var allOffering = data.solnOverview.scope.allOfferings.data.content;
    	var targetLength = locationTarget.length;
    	var offeringLength = allOffering.length;
    	var x, y;
    	if (offeringLength == 0) {
    		locationTarget = [];
    		targetLength = locationTarget.length;
    	}

    	if (targetLength > 0 && offeringLength > 0) {
    		for (y = 0, x = 0; y < targetLength && x < offeringLength; y++) {
    			if (allOffering[x].offering != locationTarget[y].offering) {
    				locationTarget.splice(y, 1);
    				targetLength = targetLength - 1;
    				y = x;
    			} else {
    				locationTarget[y].clientVolume = allOffering[y].clientVolume;
    				x = x + 1;
    			}
    		}
    	}
    	x = offeringLength;
    	y = targetLength;
    	if (x > y) {
    		for (var index = y; index < x; index++) {
    			locationTarget.push({ offering: allOffering[index].offering, clientVolume: allOffering[index].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
    		}
    	}

    	while (x < y) {
    	    locationTarget.splice(x, 1);
    	    y = y - 1;
    	}

    	vm.section.data.content(unescapeContent(locationTarget));
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040501') {
            return;
        }
        vm.section.data.content(escapeContent(vm.section.data.content()));
    	requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.section.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
    		vm.section.eTag = jqXHR.getResponseHeader('ETag');
    		requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
    	});
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

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var locationTargetViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "location-targets",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    	};
    	vm = new locationTargetViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040501", "sd-section-040501"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});