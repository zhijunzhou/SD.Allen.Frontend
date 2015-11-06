/*global define, alert, console, location*/
define('component/Section040101', function (require) {
	"use strict";
	var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040101Template.html"),
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
	}

	function onViewModelLoaded() {
		vm.section.opptyID = sectionLoaderViewModel.opptyID();
		if (vm.editable()) {
			getScopeOffering(); 
		} else {
		    var data = sectionLoaderViewModel.document();
		    var solnOverview = data.solnOverview;
		    if (solnOverview != null && solnOverview.scope != null && solnOverview.scope.allOfferings != null) {
		        doDataBinding(data);
		    }

		}
	}

	function offering(offering) {
		this.serviceLine = offering.serviceLine;
		this.offering = offering.offering;
		this.clientVolume = offering.clientVolume;
		this.nStdComponent = offering.nStdComponent;
	}

	function getScopeOffering() {
		if (vm.section.opptyID === "") {
			
		} else {
			requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
				if (oppty.status != undefined && oppty.status == 404) {
					requestAPI.errorOppty('404');
				}
				else {
					var solnOverview = oppty.data.solnOverview;
					if (solnOverview != null && solnOverview.scope !=null && solnOverview.scope.allOfferings != null) {
						vm.section.eTag = xhr.getResponseHeader('ETag');
						doDataBinding(oppty.data);
					} else {
						//load productLines from saleforce if the opptyID exist in grip;
						opptyModel.getOpptyOverviewAsync(vm.section.opptyID).done(function (opptyOverview) {
							if (opptyOverview == undefined) {
							} else {
								initOfferings(opptyOverview.productLine);	
							}
						});
					}
				}
			});
		}
	}
 
	function doDataBinding(data) {
		var content = data.solnOverview.scope.allOfferings.data.content;
		vm.section.data.content(unescapeContent(content));
	}

	function initOfferings(productLine) {
		var offering = vm.section.data.content();
		for (var k in productLine) {
			offering.push({ serviceLine: productLine[k].serviceLine, offering: productLine[k].offering, clientVolume: "", nStdComponent: "" });
		}
		vm.section.data.content(offering);
	}

	function saveOppty(event, argu) {
	    var sid = argu.sid();
	    if (sid !== '040101') {
	        return;
	    }
		vm.section.data.content(escapeContent(vm.section.data.content()));
		requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.section.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
			vm.section.eTag = jqXHR.getResponseHeader('ETag');
			requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
		});
	}

	function escapeContent(content){
		for(var i in content){
			content[i].nStdComponent = escape(content[i].nStdComponent);
		}
		return content;
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

			self.addRow = function () {
				var temp = self.section.data.content();
				temp.push({ serviceLine: "", offering: "", clientVolume: "", nStdComponent: "" });
				self.section.data.content(temp);
			};

			self.removeRow = function (index) {
				var temp = self.section.data.content();
				temp.splice(index, 1);
				self.section.data.content(temp);
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