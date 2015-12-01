/*global define, alert, console, location*/
define('component/Section0407', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0407Template.html"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
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
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.costingReport != null) {
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
        if (data !== undefined && data.solnOverview != null && data.solnOverview.costingReport != null) {
            doDataBinding(data);
        } else {
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var temp = [];
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
                }
                vm.section.data.content(temp);
            }
            vm.pageInited(true);
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
            self.pageInited = ko.observable(false);
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
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.costingReport != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
    						var temp = vm.section.data.content();
    						var allOffering = solnOverview.scope.allOfferings.data.content;
    						for (var k in allOffering) {
    						    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, xmoApproach: "", cmpyTarget: "" });
    						}
    						vm.section.data.content(temp);
    					}
    					vm.pageInited(true);
    				}
    			}
    		});
    	}
    }

    function compareWithAllOffering(allOffering, costingApproach) {
        //compare allOfferings with  costingApproach in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in costingApproach;
            var loc = -1;
            $.each(costingApproach, function (approachIndex, approach) {
                if (approach.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed approach into result ,
                     and end the query in costingApproach;
                     */
                    result.push(approach);
                    loc = approachIndex;
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new resp into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, xmoApproach: "", cmpyTarget: "" });
            }
        });

        return result;
    }

    function doDataBinding(data) {
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var costingApproach = data.solnOverview.costingReport.data.content;
        var result = compareWithAllOffering(allOffering, costingApproach)
        vm.section.data.content(result);
        vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0407') {
            return;
        }

        if (!vm.pageInited()) {
            return;
        }
        var temp = ko.toJS(vm.section.data);
        requestAPI.unifiedSave(true, temp, argu);
    }

    return {
        name: ["Section0407", "sd-section-0407"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});