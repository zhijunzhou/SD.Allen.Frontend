/*global define, alert, console, location*/
define('component/Section0406', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0406Template.html"),
        vm = {},
		requestAPI = require('model/RequestAPI'),
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
    	    //getConstraint();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.keyClientConstraint != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.keyClientConstraint != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.keyClientConstraint.data.content));
    	var content = vm.section.data.content();
    	vm.keyClientConstraint(createOriginalConstraint());
    	for (var i in content) {
    		//the number of original issues is 4 ,which equals the length of hrSolutionContent(before use '+ ' button to add rows)
    		if (i < vm.initConstraintCount) {
    			vm.keyClientConstraint()[i].checked(content[i].inScope);
    			vm.keyClientConstraint()[i].description(content[i].description);
    			vm.keyClientConstraint()[i].mitigation(content[i].mitigation);
    		} else {
    			vm.keyClientConstraint.push(new constraintRow(content[i].constraint, content[i].constraintTitle,"", true, content[i].inScope, content[i].description, content[i].mitigation));
    		}
    	}
    	initHelpTooltip();
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '0406') {
            return;
        }
        var tempArrar = [];
        for (var i in vm.keyClientConstraint()) {
            if (vm.keyClientConstraint()[i].checked()) {
                //if the line is checked, use the observable value .
            	tempArrar.push({ inScope: true, constraint: escape(vm.keyClientConstraint()[i].constraint()), constraintTitle: escape(vm.keyClientConstraint()[i].constraintTitle()),description: escape(vm.keyClientConstraint()[i].description()), mitigation: escape(vm.keyClientConstraint()[i].mitigation()) });
            } else {
            	tempArrar.push({ inScope: false, constraint: escape(vm.keyClientConstraint()[i].constraint()), constraintTitle: escape(vm.keyClientConstraint()[i].constraintTitle()), description: "", mitigation: "" });
            }
        }
        vm.section.data.content(tempArrar);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }


    function escapeContent(content) {
    	for (var i in content) {
    		content[i].constraintTitle = escape(content[i].constraintTitle);
    		content[i].description = escape(content[i].description);
    		content[i].mitigation = escape(content[i].mitigation);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].constraintTitle = unescape(content[i].constraintTitle);
    		content[i].description = unescape(content[i].description);
    		content[i].mitigation = unescape(content[i].mitigation);
    	}
    	return content;
    }

    function constraintRow(constraint, constraintTitle, hint, isOriginal, checked, description, mitigation) {
        this.constraint = ko.observable(constraint);
        this.constraintTitle = ko.observable(constraintTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.description = ko.observable(description);
        this.mitigation = ko.observable(mitigation);
    };

    function createOriginalConstraint() {
        var constraintArr = [];
        constraintArr.push(new constraintRow("ClientStandard", "Client-mandated standards and methods", "", true, false, '', ''));
        constraintArr.push(new constraintRow("ClientMandated", "Client-mandated products or tools", "",true, false, '', ''));
        constraintArr.push(new constraintRow("ClientUnionizedSupport", "Client-unionized support","If the client has a unionized labor force that will be impacted by their decision to use HPE services, how will this specifically impact the solution, the cost, delivery risks and commercial terms related to the solution?", true, false, '', ''));
        constraintArr.push(new constraintRow("Regulatory", "Data privacy and regulatory issues", "", true, false, '', ''));
        constraintArr.push(new constraintRow("ExportImport", "Export / import compliance", "Export/import compliance (global trade): Is the client a government organization, or a commercial client, involved in any activity related to the following industries: Military/Defense, Aerospace, Nuclear (including nuclear energy), Chemical, Biotech/Pharma, or High Tech Manufacturing? Does the client have activities or locations in “embargoed” or “Sanctioned” countries [Link to Embargoed/Sanctioned Country List]? Does the proposed scope of work require HPE to package or distribute customer or third party software products?", true, false, '', ''));
        constraintArr.push(new constraintRow("CMO", "HPE CMO responsibilities", "", true, false, '', ''));
        constraintArr.push(new constraintRow("Resource", "HPE or client resources", "", true, false, '', ''));
        constraintArr.push(new constraintRow("LoL", "Limits of Liability", "Describe any client requests for HPE non-standard limits of liability and how the technical solution and commercial terms will be used to mitigate  these risks.", true, false, '', ''));
        constraintArr.push(new constraintRow("OffshoreLocation", "No use of offshore locations", "", true, false, '', ''));
        constraintArr.push(new constraintRow("Timeline", "Timelines and critical dates", "Client-mandated timelines/durations and/or critical dates that HPE will be dependent upon as a part of the deployment of our services.", true, false, '', ''));
        return constraintArr; 
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var constraintViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "key-client-constraints",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.opptyItemData = ko.observable();
    		self.keyClientConstraint = ko.observableArray(createOriginalConstraint());
    		self.initConstraintCount = self.keyClientConstraint().length;
    		self.addRow = function () {
    		    self.keyClientConstraint.push(new constraintRow("Other", "", "", false, true, '', ''));
    		};

    		self.removeRow = function (index) {
    		    var temp = self.keyClientConstraint();
    		    temp.splice(index, 1);
    		    self.keyClientConstraint(temp);
    		};
    	};
    	vm = new constraintViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section0406", "sd-section-0406"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});