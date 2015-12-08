/*global define, alert, console, location*/
define('component/Section040304', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040304Template.html"),
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
    	    //getCmpyChallenge();
    	    loadSection();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.cmpyChallenge != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.solnApproach != null && data.solnOverview.solnApproach.cmpyChallenge != null) {
            doDataBinding(data);
        } else {
            self.isNewSection = true;
            // section is not existed
        }
    }

    function challengeRow(challenge, challengeTitle, hint,isOriginal, checked, description) {
        this.challenge = ko.observable(challenge);
        this.challengeTitle = ko.observable(challengeTitle);
        this.hint = hint;
        this.isOriginal = ko.observable(isOriginal);
        this.checked = ko.observable(checked);
        this.description = ko.observable(description);
    };

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.cmpyChallenge.data.content));
    	var content = vm.section.data.content();

    	if (content[1].challenge === "Trade") {
    	    content.splice(1, 1);
    	}

    	vm.cmpyChallenge(createOriginalChallenge());
    	for (var i in content) {
    	    if (i < vm.initChallengeCount) {
    			vm.cmpyChallenge()[i].description(content[i].description);
    			vm.cmpyChallenge()[i].checked(content[i].inScope);
    		} else {
    		    if (content[i].challenge === "Other") {
    		        vm.cmpyChallenge.push(new challengeRow(content[i].challenge, content[i].challengeTitle, "", true, content[i].inScope, content[i].description));
    		    }
    		}
    	}
    	initHelpTooltip();
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040304') {
            return;
        }
    	var tempArrar = [];
        for (var i in vm.cmpyChallenge()) {
            if (vm.cmpyChallenge()[i].checked()) {
                //if the line is checked, use the observable value .
            	tempArrar.push({ inScope: true, challenge: escape(vm.cmpyChallenge()[i].challenge()),challengeTitle:vm.cmpyChallenge()[i].challengeTitle(), description: escape(vm.cmpyChallenge()[i].description()) });
            } else {
            	tempArrar.push({ inScope: false, challenge: escape(vm.cmpyChallenge()[i].challenge()), challengeTitle: vm.cmpyChallenge()[i].challengeTitle(), description: "" });
            }
        }

        vm.section.data.content(tempArrar);
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
    	for (var i in content) {
    		content[i].challengeTitle = escape(content[i].challengeTitle);
    		content[i].description = escape(content[i].description);
    	}
    	return content;
    }

    function unescapeContent(content) {
    	for (var i in content) {
    		content[i].challengeTitle = unescape(content[i].challengeTitle);
    		content[i].description = unescape(content[i].description);
    	}
    	return content;
    }

    function createOriginalChallenge() {
        var challengeArr = [];
        challengeArr.push(new challengeRow("Asset", "Asset ownership/refresh", "Issues or risks related to the client's requirements for asset ownership that could negatively or positively impact the HPE solution; i.e., long refresh schedules could impact SLAs.",true, false, ''));
       // challengeArr.push(new challengeRow("Trade", "Global Trade requirements", "", true, false, ''));
        challengeArr.push(new challengeRow("Initiative", "Internal initiatives that could impact deal", "Strategic initiative resource consumption, changes to delivery model, changes to offering or SLA standards", true, false, ''));
        challengeArr.push(new challengeRow("Knowledge", "Knowledge and supportability gaps", "Are special skill sets or training required? Will the solution require extended knowledge transfer with client resources? Is employee retention an issue?", true, false, ''));
        challengeArr.push(new challengeRow("Legal", "Legal issues related to solution", "Client commercial terms/requirements that could negatively impact or limit the solution, our costs or our ability to deliver.", true, false, ''));
        challengeArr.push(new challengeRow("Sourcing", "Location Sourcing limitations", "Client requirements that cause the solution to be non-compliant with HPE location sourcing requirements.", true, false, ''));
        challengeArr.push(new challengeRow("Staffing", "Staffing Issues", "Does HPE have the resource capacity necessary to deliver the solution? Will third party resources be required?", true, false, ''));
        return challengeArr;
    }

    function createViewModel(params, componentInfo) {
    	sectionLoaderViewModel = params.viewModel;
    	onViewModelPreLoad();
    	var cmpyChallengeViewModel = function () {
    		var self = this;
    		self.section = {
    			opptyID: "",
    			eTag: "",
    			name: "company-challenges",
    			data: {
    				content: ko.observable([])
    			}
    		};
    		self.editable = ko.observable(sectionLoaderViewModel.editable());
    		self.cmpyChallenge = ko.observableArray(createOriginalChallenge());
    		self.initChallengeCount = self.cmpyChallenge().length;
    		self.addRow = function () {
    		    self.cmpyChallenge.push(new challengeRow("Other", "","", false, true, ''));
    		};

    		self.removeRow = function (index) {
    		    var temp = self.cmpyChallenge();
    		    temp.splice(index, 1);
    		    self.cmpyChallenge(temp);
    		};
    	};
    	vm = new cmpyChallengeViewModel(params);
    	onViewModelLoaded();
    	return vm;
    }

    return {
        name: ["Section040304", "sd-section-040304"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});