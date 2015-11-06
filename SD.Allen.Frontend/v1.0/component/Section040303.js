/*global define, alert, console, location*/
define('component/Section040303', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040303Template.html"),
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
    		getHRSoln();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.hrSoln != null) {
    	        doDataBinding(data);
    	    }
    	}    
    }

    function hrSoln(hrIssue, approach) {
        self.hrIssue = hrIssue;
        self.approach = approach;
    };

    function getHRSoln() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.hrSoln != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);
    				} else {
    					// section is not existed
    				}
    			}
    		});
    	}                   
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.hrSoln.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		if (i < vm.initIssueCount) {
    			vm.hrSolutionContent()[i].approach(content[i].approach);
    			vm.hrSolutionContent()[i].checked(content[i].inScope);
    		} else {
    			vm.hrSolutionContent.push(new vm.hrSolnRow(content[i].hrIssue, content[i].hrIssueTitle, true, content[i].inScope, content[i].approach));
    		}
    	}
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040303') {
            return;
        }
        var content = [];
        for (var i in vm.hrSolutionContent()) {
        	if (vm.hrSolutionContent()[i].checked()) {
        		//if the line is checked, use the observable value .
        		content.push({ inScope: true, hrIssue: vm.hrSolutionContent()[i].hrIssue(), hrIssueTitle: vm.hrSolutionContent()[i].hrIssueTitle(), approach: escape(vm.hrSolutionContent()[i].approach()) });
        	} else {
        		content.push({ inScope: false, hrIssue: vm.hrSolutionContent()[i].hrIssue(), hrIssueTitle: vm.hrSolutionContent()[i].hrIssueTitle(), approach: "" });
        	}
        }
        vm.section.data.content(content);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].hrIssueTitle = escape(content[i].hrIssueTitle);
    		content[i].approach = escape(content[i].approach);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].hrIssueTitle = unescape(content[i].hrIssueTitle);
    		content[i].approach = unescape(content[i].approach);
    	}
    	return content;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var hrSolnViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "hr-solutions",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.hrSolnRow = function (hrIssue, hrIssueTitle, isOriginal, checked, approach) {
    			this.hrIssue = ko.observable(hrIssue);
    			this.hrIssueTitle = ko.observable(hrIssueTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.approach = ko.observable(approach);
    		};

    		var hrSolnArray = [];
    		hrSolnArray.push(new self.hrSolnRow("ClientEmployee", "Client's Employees", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("ClientSubcontractor", "Client's Subcontractors", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("ClientContractor", "Client's Third Party Contractors", true, false, ''));
    		hrSolnArray.push(new self.hrSolnRow("HPEmployee", "Existing HPE Employees (Renewals only)", true, false, ''));
    		self.initIssueCount = hrSolnArray.length;
    		self.hrSolutionContent = ko.observableArray(hrSolnArray);

    		self.addRow = function () {
    		    self.hrSolutionContent.push(new self.hrSolnRow("Other", "", false, true, ""))
    		};
    	    
    		self.removeRow = function (index) {
    		    var temp = self.hrSolutionContent();
    		    temp.splice(index, 1);
    		    self.hrSolutionContent(temp);
    		};
    	};
    	vm = new hrSolnViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040303", "sd-section-040303"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});