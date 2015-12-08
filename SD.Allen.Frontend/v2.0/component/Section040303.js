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
    	$(window).off("updateSection");
    	$(window).on("updateSection", function (e, newViewModel) {
    	    loadSection(newViewModel);
    	});
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function initHelpTooltip() {
        var options = {
            animation: true,
        };
        $('.sd-section-help').tooltip();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    	    //getHRSoln();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.hrSoln != null) {
    	        doDataBinding(data);
    	    }
    	}    
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();

        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.hrSoln != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function hrSoln(hrIssue, approach) {
        self.hrIssue = hrIssue;
        self.approach = approach;
    };

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.hrSoln.data.content));
    	var content = vm.section.data.content();
    	vm.hrSolutionContent(createOriginallHrsoln());
    	for (var i in content) {
    		if (i < vm.initIssueCount) {
    			vm.hrSolutionContent()[i].approach(content[i].approach);
    			vm.hrSolutionContent()[i].checked(content[i].inScope);
    		} else {
    			vm.hrSolutionContent.push(new hrSolnRow(content[i].hrIssue, content[i].hrIssueTitle, "",true, content[i].inScope, content[i].approach));
    		}
    	}
    	initHelpTooltip();
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
        requestAPI.unifiedSave(true, temp, argu);
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

    function hrSolnRow(hrIssue, hrIssueTitle, hint, isOriginal, checked, approach) {
        this.hrIssue = ko.observable(hrIssue);
        this.hrIssueTitle = ko.observable(hrIssueTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.approach = ko.observable(approach);
    };

    function createOriginallHrsoln() {
        var hrSolnArray = [];
        hrSolnArray.push(new hrSolnRow("ClientEmployee", "Client's Employees", "Issues or risks related to the client's employees that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("ClientSubcontractor", "Client's Subcontractors", "Issues or risks related to the client's subcontractors that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("ClientContractor", "Client's Third Party Contractors", "Issues or risks related to the client's third parties that could negatively or positively impact the HPE solution.", true, false, ''));
        hrSolnArray.push(new hrSolnRow("HPEmployee", "Existing HPE Employees (Renewals only)", "HPE plans for existing account support employees that could negatively or positively impact the HPE solution.", true, false, ''));
        return hrSolnArray;
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
    		self.hrSolutionContent = ko.observableArray(createOriginallHrsoln());
    		self.initIssueCount = self.hrSolutionContent().length;

    		self.addRow = function () {
    		    self.hrSolutionContent.push(new hrSolnRow("Other", "","", false, true, ""))
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