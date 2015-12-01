/*global define, alert, console, location*/
define('component/Section040101', function (require) {
	"use strict";
	var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040101Template.html"),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        appUtility = require('util/AppUtility'),
        jquery_bootstrap = require('jquery_bootstrap'),
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
	    $.messager.model = {
	        ok: { text: "Delete",classed: "btn-default" },
	        cancel: { text: "Cancel", classed: "btn-error" }
	    };
	}

	function onViewModelLoaded() {
		vm.section.opptyID = sectionLoaderViewModel.opptyID();
		if (vm.editable()) {
		    loadSection();
		} else {
		    var data = sectionLoaderViewModel.document();
		    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
		        doDataBinding(data);
		    }
		}
	}

	function loadSection(latestedSectionLoaderViewModel) {
	    if (latestedSectionLoaderViewModel) {
	        sectionLoaderViewModel = latestedSectionLoaderViewModel;
	    }
	    var data = sectionLoaderViewModel.document();
	    if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
	        doDataBinding(data);
	    } else {
	        //load productLines from saleforce if the opptyID exist in grip;
	        sp.app.workingDialog.show("Loading productLines from grip .");
	        opptyModel.getOpptyOverviewAsync(vm.section.opptyID).done(function (opptyOverview) {
	            sp.app.workingDialog.hide("Loading productLines from grip .");
	            if (opptyOverview == undefined) {
	            } else {
	                initOfferings(opptyOverview.productLine);
	            }
	        });
	    }
	}

	function offering(offering) {
	    this.offeringId = offering.offeringId;
		this.serviceLine = offering.serviceLine;
		this.offering = offering.offering;
		this.clientVolume = offering.clientVolume;
		this.nStdComponent = offering.nStdComponent;
	}

	function doDataBinding(data) {
		var content = data.solnOverview.scope.allOfferings.data.content;
		vm.section.data.content(unescapeContent(content));

		vm.pageInited(true);
	}

	function initOfferings(productLine) {
		var offering = [];
		for (var k in productLine) {
		    offering.push({ offeringId: appUtility.newGuid(), serviceLine: productLine[k].serviceLine, offering: productLine[k].offering, clientVolume: "", nStdComponent: "" });
		}
		vm.section.data.content(offering);
		vm.pageInited(true);
	}

	function saveOppty(event, argu) {
	    var sid = argu.sid();
	    if (sid !== '040101') {
	        return;
	    }
	    if (!vm.pageInited()) {
	        return;
	    }
	    var temp = escapeContent(ko.toJS(vm.section.data));
	    requestAPI.unifiedSave(true, temp, argu);
	}

	function escapeContent(data){
		for(var i in data.content){
			data.content[i].nStdComponent = escape(data.content[i].nStdComponent);
		}
		return data;
	}

	function unescapeContent(content){
		for(var i in content){
			content[i].nStdComponent = unescape(content[i].nStdComponent);
		}
		return content;
	}

	function createViewModel(params, componentInfo) {
		sectionLoaderViewModel = params.viewModel;
		onViewModelPreLoad();
		var offeringViewModel = function () {
			var self = this;
			self.section = {
				opptyID: "",
				eTag: "",
				name: "all-offerings",
				data: {
					content: ko.observable([]),
				}
			};
			self.editable = ko.observable(sectionLoaderViewModel.editable());
			self.pageInited = ko.observable(false);
			self.addRow = function () {
				var temp = self.section.data.content();
				temp.push({ offeringId:appUtility.newGuid(),serviceLine: "", offering: "", clientVolume: "", nStdComponent: ""});
				self.section.data.content(temp);
			};
			
			self.removeRow = function (index) {
			    var temp = self.section.data.content();
			    var offering = temp[index].offering;
			    $.messager.confirm("An item will be deleted", "<span class=text-warning><b>&nbsp;&nbsp;" + "If you click 'Delete' ,the offering which are cascaded from 'all-Offering' will be deleted meanwhile ! Are you sure to delete the offering '" + offering + "' ? " + "</b></span>", function () {
			        temp.splice(index, 1);
			        self.section.data.content(temp);
			    });
			};
		};
		vm = new offeringViewModel(params);
		onViewModelLoaded();
		return vm;
	}

	return {
		name: ["Section040101", "sd-section-040101"],
		template: templateHtml,
		viewModel: {
			createViewModel: createViewModel
		}
	}
});