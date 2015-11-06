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
    }

    function onViewModelPreLoad() {
    	listenCustomEvent();
    }

    function onViewModelLoaded() {
    	vm.section.opptyID = sectionLoaderViewModel.opptyID();
    	if (vm.editable()) {
    		getCmpyChallenge();
    	} else {
    	    var data = sectionLoaderViewModel.document();
    	    var solnOverview = data.solnOverview;
    	    if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.cmpyChallenge != null) {
    	        doDataBinding(data);
    	    }
    	}
    }

    function getCmpyChallenge() {
    	if (vm.section.opptyID === "") {

    	} else {
    		requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
    			if (oppty.status != undefined && oppty.status == 404) {
    				requestAPI.errorOppty('404');
    			}
    			else {
    				var solnOverview = oppty.data.solnOverview;
    				if (solnOverview != null && solnOverview.solnApproach != null && solnOverview.solnApproach.cmpyChallenge != null) {
    					vm.section.eTag = xhr.getResponseHeader('ETag');
    					doDataBinding(oppty.data);	
    				} else {
    					self.isNewSection = true;
    					// section is not existed
    				}
    			}
    		});
    	}
    }

    function doDataBinding(data) {
    	vm.section.data.content(unescapeContent(data.solnOverview.solnApproach.cmpyChallenge.data.content));
    	var content = vm.section.data.content();
    	for (var i in content) {
    		if (i < vm.initChallengeCount) {
    			vm.cmpyChallenge()[i].description(content[i].description);
    			vm.cmpyChallenge()[i].checked(content[i].inScope);
    		} else {
    			vm.cmpyChallenge.push(new vm.challengeRow(content[i].challenge, content[i].challengeTitle, true, content[i].inScope, content[i].description));
    		}
    	}
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
        requestAPI.updateSection(vm.section.opptyID, vm.section.name, temp, vm.section.eTag).done(function (data, textStatus, jqXHR) {
        	vm.section.eTag = jqXHR.getResponseHeader('ETag');
        	requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
        });
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
    		self.challengeRow = function (challenge, challengeTitle, isOriginal, checked, description) {
    			this.challenge = ko.observable(challenge);
    			this.challengeTitle = ko.observable(challengeTitle);
    			this.isOriginal = ko.observable(isOriginal);
    			this.checked = ko.observable(checked);
    			this.description = ko.observable(description);
    		};

    		var challengeArr = [];
    		challengeArr.push(new self.challengeRow("Asset", "Asset ownership/refresh", true, false, ''));
    		challengeArr.push(new self.challengeRow("Trade", "Global Trade requirements", true, false, ''));
    		challengeArr.push(new self.challengeRow("Initiative", "Internal initiatives that could impact deal", true, false, ''));
    		challengeArr.push(new self.challengeRow("Knowledge", "Knowledge and supportability gaps", true, false, ''));
    		challengeArr.push(new self.challengeRow("Legal", "Legal issues related to solution", true, false, ''));
    		challengeArr.push(new self.challengeRow("Sourcing", "Location Sourcing limitations", true, false, ''));
    		challengeArr.push(new self.challengeRow("Staffing", "Staffing Issues", true, false, ''));

    		self.initChallengeCount = challengeArr.length;
    		self.cmpyChallenge = ko.observableArray(challengeArr);
    		self.addRow = function () {
    		    self.cmpyChallenge.push(new self.challengeRow("Other", "", false, true, ''));
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