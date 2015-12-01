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
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    	$(".popover-options a").popover({ html: true });
    	$('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.locationTarget != null) {
    	        if (data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
    	            doDataBinding(data);
    	        }
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.locationTarget != null) {
            doDataBinding(data);
        } else {
            // section is not existed
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var temp = [];
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, clientVolume: allOffering[k].clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
                }
                vm.section.data.content(temp);
            }
            vm.pageInited(true);
        }
    }

    function compareWithAllOffering(allOffering, locationTarget) {
        //compare allOfferings with  locationTarget in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in locationTarget;
            var loc = -1;
            $.each(locationTarget, function (targetIndex, target) {
                if (target.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed locationTarget into result ,
                     and end the query in locationTarget;
                     */
                    var temp = target;
                    temp.clientVolume = offering.clientVolume;
                    result.push(temp);
                    loc = targetIndex;
                    Array.removeAt(locationTarget, targetIndex);
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new locationTarget into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, clientVolume: offering.clientVolume, onShoreWorkLoad: "", rdcWorkload: "", gdcWorkload: "", comment: "", });
            }
        });
        return result;
    }

    function doDataBinding(data) {
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var locationTarget = data.solnOverview.deliveryStrategies.locationTarget.data.content;
    	var result = compareWithAllOffering(allOffering, locationTarget)
    	vm.section.data.content(unescapeContent(result));
    	vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040501') {
            return;
        }
        if (!vm.pageInited()) {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(data) {
    	for (var i in data.content) {
    		data.content[i].comment = escape(data.content[i].comment);
    	}
    	return data;
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
    		self.pageInited = ko.observable(false);
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