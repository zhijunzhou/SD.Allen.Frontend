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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getConstraint();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.keyClientConstraint != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getConstraint() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				//alert(JSON.stringify(oppty));
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.keyClientConstraint != null) {
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
    	vm.section.data.content(unescapeContent(data.solnOverview.keyClientConstraint.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		//the number of original issues is 4 ,which equals the length of hrSolutionContent(before use '+ ' button to add rows)
    		if (i < vm.initConstraintCount) {
    			vm.keyClientConstraint()[i].checked(content[i].inScope);
    			vm.keyClientConstraint()[i].description(content[i].description);
    			vm.keyClientConstraint()[i].mitigation(content[i].mitigation);
    		} else {
    			vm.keyClientConstraint.push(new vm.constraintRow(content[i].constraint, content[i].constraintTitle, true, content[i].inScope, content[i].description, content[i].mitigation));
    		}
    	}
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
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
    		self.constraintRow = function (constraint, constraintTitle, isOriginal, checked, description, mitigation) {
    			this.constraint = ko.observable(constraint);
    			this.constraintTitle = ko.observable(constraintTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.description = ko.observable(description);
    			this.mitigation = ko.observable(mitigation);
    		};

    		self.opptyItemData = ko.observable();
    		var constraintArr = [];
    		constraintArr.push(new self.constraintRow("ClientStandard", "Client-mandated standards and methods", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ClientMandated", "Client-mandated products or tools", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ClientUnionizedSupport", "Client-unionized support", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Regulatory", "Data privacy and regulatory issues", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("ExportImport", "Export / import compliance", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("CMO", "HPE CMO responsibilities", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Resource", "HPE or client resources", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("LoL", "Limits of Liability", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("OffshoreLocation", "No use of offshore locations", true, false, '', ''));
    		constraintArr.push(new self.constraintRow("Timeline", "Timelines and critical dates", true, false, '', ''));

    		self.initConstraintCount = constraintArr.length;
    		self.keyClientConstraint = ko.observableArray(constraintArr);
    		self.addRow = function () {
    		    self.keyClientConstraint.push(new self.constraintRow("Other", "", false, true, '', ''));
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