/*global define, alert, location*/
define('component/Section0202', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        peoplePicker = require('./PeoplePicker'),
        templateHtml = require("text!./Section0202Template.html"),
        opptyModel = require('model/Oppty'),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function onViewModelPreLoad() {
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
    }

    function contact(contact) {
        this.title = contact.title;
        this.name = contact.name;
        this.email = contact.email;
        this.sipAddress = contact.sipAddress;
        this.type = contact.type;
    }
    function mappingResult(data, isEmpty) {
        this.data = data;
        this.isEmpty = isEmpty;
    }
    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", updateContact);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }
    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            loadSection();
            //getContact();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data != undefined && data.opptyOverview != null && data.opptyOverview.contact != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data === undefined) {
            getContact();
        } else {
            var opptyOverview = data.opptyOverview;
            if (opptyOverview != null && opptyOverview.contact != null) {
                doDataBinding(data);
            } else {
                vm.pageInited(true);
                computeRegionOrder();
            }
        }
    }

    function region(name, title) {
        this.name = name;
        this.title = title;
    }

    function getContact() {
        if (vm.section.opptyID === "") {

        } else {
            requestAPI.getSectionByIDAndSectionNameAsync(vm.section.opptyID, vm.section.name).done(function (oppty, xhr) {
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                }
                else {
                    var opptyOverview = oppty.data.opptyOverview;
                    if (opptyOverview != null && opptyOverview.contact != null) {
                        vm.section.eTag = xhr.getResponseHeader('ETag');
                        doDataBinding(oppty.data);
                    } else {
                        vm.pageInited(true);
                        computeRegionOrder();
                    }
                }
            });
        }
    }

    function doDataBinding(data) {
        computeRegionOrder();
        var contact = data.opptyOverview.contact.data;
        var coreTeam = contact.coreTeam;
        for (var role in coreTeam) {
            for (var region in coreTeam[role]) {
                if (coreTeam[role][region] != null) {
                    vm.data.coreTeam[role][region](coreTeam[role][region]);
                }
            }
        }
        var extendTeam = contact.extendTeam;
        for (var role in extendTeam) {
            for (var region in extendTeam[role]) {
                if (region == "dueDiligenceLead") {
                    if (extendTeam[role][region] != null) {
                        vm.data.extendTeam[role][region](extendTeam[role][region]);
                    }
                } else {
                    if (extendTeam[role][region] != null) {
                        vm.data.extendTeam[role][region](extendTeam[role][region]);
                    }
                }
            }
        }
        vm.pageInited(true);
    }

    function computeRegionOrder() {
        //var oppty = data.opptyOverview.opptyData.data;
        var tempOppty = sectionLoaderViewModel.document().opptyOverview.opptyData.data;
        var involvedRegion = tempOppty.region;
        var index = 1;
        if (tempOppty.leadRegion !== "NA") {
            vm.leadRegion(new region(tempOppty.leadRegion, tempOppty.leadRegion.toUpperCase()));
            for (var re in involvedRegion) {
                if (re == vm.leadRegion().name) {
                    continue;
                }
                if (re != vm.leadRegion().name && involvedRegion[re].inScope) {
                    index = index + 1;
                    if (index == 2) {
                        vm.secondRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 3) {
                        vm.thirdRegion(new region(re, re.toUpperCase()));
                    }
                }
            }
        } else {
            for (var re in involvedRegion) {
                if (involvedRegion[re].inScope) {
                    index = index + 1;
                    if (index == 2) {
                        vm.leadRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 3) {
                        vm.secondRegion(new region(re, re.toUpperCase()));
                    }
                    if (index == 4) {
                        vm.thirdRegion(new region(re, re.toUpperCase()));
                    }
                }
            }
        }
    }

    function updateContact(event, argu) {
        var sid = argu.sid();
        if (sid !== '0202') {
            return;
        }
        if (!vm.pageInited()) {
            console.log("page has not been inited !");
            return;
        }

        var saveFunc = function () {
            if (($(".sp-peoplepicker-waitImg:visible").length > 0)) {
                setTimeout(saveFunc, 250);
            } else {
                var mappingResult = doDataMapping();
                if (!mappingResult.isEmpty) {
                    requestAPI.unifiedSave(true, mappingResult.data, argu);
                } else {
                    alert("Fill in one contact at least!");
                }
            }
        }
        setTimeout(saveFunc, 250);
    }

    function doDataMapping() {
        var emptyContact = true;
        var contacts = ko.toJS(vm.data);
        var coreTeam = contacts.coreTeam;
        for (var role in coreTeam) {
            for (var region in coreTeam[role]) {
                if (coreTeam[role][region] != undefined && coreTeam[role][region].length != 0 && coreTeam[role][region][0] != undefined) {
                    emptyContact = false;
                    var c = new contact(coreTeam[role][region][0]);
                    contacts.coreTeam[role][region] = c;
                } else {
                    if (contacts.coreTeam[role][region] === undefined) {
                        contacts.coreTeam[role][region] = null;
                    } else {
                        if (coreTeam[role][region] !== null && coreTeam[role][region].length === 0) {
                            contacts.coreTeam[role][region] = null;
                        } else {
                            emptyContact = false;
                        }
                    }
                }
            }
        }
        var extendTeam = contacts.extendTeam;
        for (var role in extendTeam) {
            for (var region in extendTeam[role]) {
                if (region == "dueDiligenceLead") {
                    if (extendTeam[role][region] != undefined && extendTeam[role][region].length != 0 && extendTeam[role][region][0] != undefined) {
                        emptyContact = false;
                        var c = new contact(extendTeam[role][region][0]);
                        contacts.extendTeam[role][region] = c;
                    } else {
                        if (contacts.extendTeam[role][region] === undefined) {
                            contacts.extendTeam[role][region] = null;
                        } else {
                            if (extendTeam[role][region] !== null && extendTeam[role][region].length === 0) {
                                contacts.extendTeam[role][region] = null;
                            } else {
                                emptyContact = false;
                            }
                        }
                    }
                } else {
                    if (extendTeam[role][region].length > 0) {
                        emptyContact = false;
                        contacts.extendTeam[role][region] = extendTeam[role][region];
                    }
                }
            }
        }
        return new mappingResult(contacts, emptyContact);
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var contactViewModel = function (params) {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "contacts"
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.data = {
                coreTeam: {
                    primary: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, ams: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, apj: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }, emea: {
                        acctExecutive: ko.observable(),
                        bidMgr: ko.observable(),
                        dealAnalyst: ko.observable(),
                        deliveryOwner: ko.observable(),
                        hrLead: ko.observable(),
                        legalContractMgmtLead: ko.observable(),
                        opptyConsultant: ko.observable(),
                        proposalMgr: ko.observable(),
                        pursuitEngagementMgr: ko.observable(),
                        salesExecutive: ko.observable(),
                        solnConsultant: ko.observable(),
                        solnLead: ko.observable(),
                        strategicPursuitLead: ko.observable(),
                        tntLead: ko.observable()
                    }
                }, extendTeam: {
                    primary: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, ams: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, apj: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }, emea: {
                        dealIntake: ko.observableArray(),
                        dueDiligenceLead: ko.observable(),
                        otherIntlBizPartner: ko.observableArray(),
                        practiceArch: ko.observableArray(),
                        proposalSupport: ko.observableArray()
                    }
                }
            }
            self.roleCollection = [
                "Account Executive",
                "Bid Manager",
                "Deal Analyst",
                "Delivery Owner",
                "HR Lead",
                "Legal/Contract Management Lead",
                "Opportunity Consultant",
                "Proposal Manager",
                "Pursuit Engagement Manager",
                "Sales Executive",
                "Solution Consultant",
                "Solution Lead",
                "Strategic Pursuit Lead",
                "T&T Leader"
            ];

            self.extendRoleCollection = [
                "Deal Intake (multiple rows/names)",
                "Due Diligence Leader",
                "Other Internal Business Partners (multiple rows/names)",
                "Practice Architects (multiple rows/names)",
                "Proposal Support (multiple rows/names)"
            ];

            self.involvedRegion = ko.observableArray();
            self.leadRegion = ko.observable();
            self.secondRegion = ko.observable();
            self.thirdRegion = ko.observable();

            self.opptyItem = ko.observable();

            self.pageInited = ko.observable(false);
            self.peoplePickerInited = ko.observable(true);

            self.save = function save(viewModel) {
                $(window).trigger("opptySaving", self);
            };
        };
        vm = new contactViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["Section0202", "sd-section-0202"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [peoplePicker]
    };

});