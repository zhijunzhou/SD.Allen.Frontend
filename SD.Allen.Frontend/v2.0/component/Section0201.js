/*global define, alert, location*/
define('component/Section0201', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dateTimePicker = require('./DateTimePicker'),
        templateHtml = require("text!./Section0201Template.html"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        numBox = require('numBox'),
        requestAPI = require('model/RequestAPI'),
        dollarFormatter = require('./DollarFormatter'),
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
        initNumBox();
    }

    function initNumBox() {
        $('.inputUSD').NumBox({ symbol: "$", max: Math.pow(10, 20), min: 0,places:0});
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        //get oppty id from query string
        if (vm.section.opptyID === "") {
            //new oppty
            vm.isNewOppty(true);
            // loadGripData();
        } else {
            loadSection();
            //loadOpptyData(vm.section.opptyID);
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        vm.editable(sectionLoaderViewModel.editable());
        var data = sectionLoaderViewModel.document();
        if (data === undefined) {
            loadOpptyData(vm.section.opptyID);
        } else {
            if (data.opptyOverview !== undefined && data.opptyOverview.opptyData !== undefined) {
                var opptyData = data.opptyOverview.opptyData.data;
                doDataBinding(opptyData);
            }
        }
    }

    function updateLeadGBU(newGBU) {
        switch (newGBU) {
            case 'apps':
                vm.data.involvedGbu.apps().inScope(true);
                break;
            case 'bps':
                vm.data.involvedGbu.bps().inScope(true);
                break;
            case 'ess':
                vm.data.involvedGbu.ess().inScope(true);
                break;
            case 'ito':
                vm.data.involvedGbu.ito().inScope(true);
                break;
            case 'hpeOther':
                vm.data.involvedGbu.hpeOther().inScope(true);
                break;
            case 'hpi':
                vm.data.involvedGbu.hpi().inScope(true);
                break;
            default:
                vm.data.involvedGbu.ito().inScope(true);
                break;
        }
		
    }
    function updateRegion(region) {
        region = region.toLowerCase();
        switch (region) {
            case 'ams':
                vm.data.region.ams().inScope(true);
                break;
            case 'apj':
                vm.data.region.apj().inScope(true);
                break;
            case 'emea':
                vm.data.region.emea().inScope(true);
                break;
            case 'na':
                vm.data.region.ams().inScope(false);
                vm.data.region.apj().inScope(false);
                vm.data.region.emea().inScope(false);
                break;
        }
        if (region == 'na') {
            vm.data.leadRegion('NA');
            if (sectionLoaderViewModel.document() !== null && sectionLoaderViewModel.document() !== undefined) {
                sectionLoaderViewModel.document().opptyOverview.opptyData.data.leadRegion = 'NA';
            }
        } else {
            vm.data.leadRegion(region);
            if (sectionLoaderViewModel.document() !== null && sectionLoaderViewModel.document() !== undefined) {
                sectionLoaderViewModel.document().opptyOverview.opptyData.data.leadRegion = region;
            }
        }
    }

    function updateLeadRegion(newCntry) {
        if (typeof newCntry === 'string') {
            var region = $('[id="sd-leadCntry"] option[value="' + newCntry + '"]').parent().attr('label');
            if (newCntry != 'NA' && region !== undefined && region !== null) {
                updateRegion(region);
            }
            if (newCntry == 'NA') {
                updateRegion("NA");
            }
        }
    }
    //clear value of Tcv or Fyr when the relavant unit is not in Scope;
    function updateInvolvedGbu(inScope, gbuName) {
        switch (gbuName) {
            case 'apps':
                if (!inScope) {
                    vm.data.involvedGbu.apps().tcv(0);
                    vm.data.involvedGbu.apps().fyr(0);
                }
                break;
            case 'bps':
                if (!inScope) {
                    vm.data.involvedGbu.bps().tcv(0);
                    vm.data.involvedGbu.bps().fyr(0);
                }
                break;
            case 'ito':
                if (!inScope) {
                    vm.data.involvedGbu.ito().tcv(0);
                    vm.data.involvedGbu.ito().fyr(0);
                }
                break;
            case 'ess':
                if (!inScope) {
                    vm.data.involvedGbu.ess().tcv(0);
                    vm.data.involvedGbu.ess().fyr(0);
                }
                break;
            case 'hpeOther':
                if (!inScope) {
                    vm.data.involvedGbu.hpeOther().tcv(0);
                    vm.data.involvedGbu.hpeOther().fyr(0);
                }
                break;
            case 'hpi':
                if (!inScope) {
                    vm.data.involvedGbu.hpi().tcv(0);
                    vm.data.involvedGbu.hpi().fyr(0);
                }
                break;
        }
    }

    function updateGlabalDocument(inScope, region) {
        if (!vm.isNewOppty()) {
            sectionLoaderViewModel.document().opptyOverview.opptyData.data.region[region].inScope = inScope;
        }
    }

    function executeVerifications() {
        if (checkRequiredField() === true && checkIdFormat(vm.data.opptyID()) === true && checkContractDate() === true && compareFryAndTcv() === true) {
            return true;
        } else {
            return false;
        }
    }

    function saveOppty(event, argu) {
        if (executeVerifications() === true) {
            var sid = argu.sid();
            if (sid !== '0201') {
                return;
            }
            if (verifyOpptyTcvAndOpptyFyr(vm) !== true && confirm("The Opportunity TCV should be equal to the combined total of all GBU TCV. The Opportunity FYR should be equal to the combined total of all GBU FYR.Are you sure to save?") === false) {
                return;
            }
            if (vm.isNewOppty()) {
                sp.app.workingDialog.show("Saving opportunity overview.");
                requestAPI.createOpptyDocument(ko.toJS(vm.data)).done(function (data) {
                    sp.app.workingDialog.hide("Saving opportunity overview.");
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    if (data != undefined && data.status == undefined) {
                        sid = "0202";
                        window.location.href = sp.app.config.ENV.SectionLoaderUrl + "?sid=" + sid + "&OpptyID=" + vm.data.opptyID();
                    }
                });
            } else {
                vm.data.pursuitWeb.link(vm.data.pursuitWeb.link());
                requestAPI.unifiedSave(true, ko.toJS(vm.data), argu);
                //window.localStorage.setItem(vm.section.opptyID + "_" + vm.section.name, JSON.stringify(ko.toJS(vm.data)));
                //console.log("save " + vm.section.opptyID + "_" + vm.section.name);
                //console.log(ko.toJS(vm.data));
            }
        } else {
        }
    }

    function loadOpptyData(opptyID) {
        var dataStr = window.localStorage.getItem(opptyID + "_" + vm.section.name);
        sp.app.workingDialog.show("Loading opportunity overview .");
        requestAPI.getSectionByIDAndSectionNameAsync(opptyID, vm.section.name).done(function (oppty, xhr) {
            sp.app.workingDialog.hide("Loading opportunity overview .");
            if (oppty.data === undefined) {
                vm.data.opptyID(opptyID);
            } else {
                vm.section.eTag = xhr.getResponseHeader('ETag');
                var data = oppty.data.opptyOverview.opptyData.data;
                doDataBinding(data);
            }
        }).then(function (oppty) {
            //query sales force
        });
    }

    function doDataBinding(data) {
        vm.data.opptyID(data.opptyId);
        vm.data.opptyName(data.opptyName);
        vm.data.salesStage(data.salesStage);
        vm.data.opptyType(data.opptyType);
        vm.data.dealStatus(data.dealStatus);
        vm.data.clientName(data.clientName);
        vm.data.opptyTcv(data.opptyTcv);
        vm.data.opptyFyr(data.opptyFyr);
        vm.data.leadBizUnit(data.leadBizUnit);
        vm.data.contractTerm(data.contractTerm);
        vm.data.leadCntry(data.leadCntry);
        vm.salesStageName($("#sd-SalesStage option[value='" + data.salesStage + "']").attr("label"));
        vm.leadCntryName($("#sd-Cntry option[value='" + data.leadCntry + "']").attr("label"));
        vm.data.clientCntry(data.clientCntry);
        vm.clientCntryName($("#sd-Cntry option[value='" + data.clientCntry + "']").attr("label"));
        vm.data.involvedGbu.apps().inScope(data.involvedGbu.apps.inScope);

        vm.data.involvedGbu.bps().inScope(data.involvedGbu.bps.inScope);
        vm.data.involvedGbu.ito().inScope(data.involvedGbu.ito.inScope);
        vm.data.involvedGbu.hpeOther().inScope(data.involvedGbu.hpeOther.inScope);
        vm.data.involvedGbu.ess().inScope(data.involvedGbu.ess.inScope);
        vm.data.involvedGbu.hpi().inScope(data.involvedGbu.hpi.inScope);

        vm.data.involvedGbu.apps().tcv(data.involvedGbu.apps.tcv);
        vm.data.involvedGbu.bps().tcv(data.involvedGbu.bps.tcv);
        vm.data.involvedGbu.ito().tcv(data.involvedGbu.ito.tcv);
        vm.data.involvedGbu.hpeOther().tcv(data.involvedGbu.hpeOther.tcv);
        vm.data.involvedGbu.ess().tcv(data.involvedGbu.ess.tcv);
        vm.data.involvedGbu.hpi().tcv(data.involvedGbu.hpi.tcv);

        vm.data.involvedGbu.apps().fyr(data.involvedGbu.apps.fyr);
        vm.data.involvedGbu.bps().fyr(data.involvedGbu.bps.fyr);
        vm.data.involvedGbu.ito().fyr(data.involvedGbu.ito.fyr);
        vm.data.involvedGbu.hpeOther().fyr(data.involvedGbu.hpeOther.fyr);
        vm.data.involvedGbu.ess().fyr(data.involvedGbu.ess.fyr);
        vm.data.involvedGbu.hpi().fyr(data.involvedGbu.hpi.fyr);

        vm.data.clientCntry(data.clientCntry);
        if (data.contractSignDate != null) {
            vm.data.contractSignDate(data.contractSignDate);
        }
        if (data.contractStartDate != null) {
            vm.data.contractStartDate(data.contractStartDate);
        }
        vm.data.pursuitClassfication(data.pursuitClassfication);
        vm.data.solnGovTrack(data.solnGovTrack);

        vm.data.region.ams().inScope(data.region.ams.inScope);
        vm.data.region.apj().inScope(data.region.apj.inScope);
        vm.data.region.emea().inScope(data.region.emea.inScope);

        vm.data.pursuitWeb.title(data.pursuitWeb.title);
        vm.data.pursuitWeb.link(data.pursuitWeb.link);

        initNumBox();
    }

    function loadGripData(opptyID) {
        if (opptyID !== undefined && opptyID !== "") {
            sp.app.workingDialog.show("Loading opportunity data from grip.");
            requestAPI.getOpptyByIDAsync(opptyID).done(function (xhr) {
                sp.app.workingDialog.hide("Loading opportunity data from grip.");
                if (xhr.status == "404") {
                    vm.existedInSystem(false);
                    vm.isNewOppty(true);
                    sp.app.workingDialog.show("Checking if the opportunity is existed on server.");
                    opptyModel.getOpptyOverviewAsync(opptyID).done(function (opptyOverview) {
                        sp.app.workingDialog.hide("Checking if the opportunity is existed on server.");
                        if (opptyOverview == undefined) {
                            vm.existedInSalesForce(false);
                        } else {
                            vm.existedInSalesForce(true);
                            vm.data.opptyID(opptyOverview.opptyID);
                            vm.data.opptyName(opptyOverview.opptyName);

                            vm.data.salesStage(opptyOverview.salesStage.substr(0, 2));
                            vm.data.opptyType(opptyOverview.opptyType);
                            vm.data.dealStatus(opptyOverview.dealStatus);
                            vm.data.clientName(opptyOverview.clientName);

                            var tcv = opptyOverview.opptyTcv.replace("$", "");
                            if (tcv != "") {
                                vm.data.opptyTcv(Math.floor(parseFloat(tcv.split(",").join(""))));
                            }

                            var fyr = opptyOverview.opptyFyr.replace("$", "");
                            if (fyr != "") {
                                vm.data.opptyFyr(Math.floor(parseFloat(fyr.split(",").join(""))));
                            }

                            //if (opptyOverview.leadBizUnit == "Enterprise Security Products") {
                            //	vm.data.leadBizUnit("ess");
                            //} else if (opptyOverview.leadBizUnit == "ITO GBU") {
                            //	vm.data.leadBizUnit("ito");
                            //} else {
                            //	//default leadBU value;
                            //	vm.data.leadBizUnit("ito");
                            //}

                            vm.data.contractTerm(opptyOverview.contractTerm);
                            vm.data.contractSignDate((appUtility.transformIOSDateToen(opptyOverview.contractSignDate)));
                            //vm.data.leadCntry(opptyOverview.leadCntry);
                            $("#sd-leadCntry option[label='" + opptyOverview.leadCntry + "']").attr("selected", true);
                            vm.data.leadCntry($("#sd-leadCntry option[label='" + opptyOverview.leadCntry + "']").attr("value"));
                            //vm.data.clientCntry(opptyOverview.clientCntry);
                            $("#sd-clientCntry option[label='" + opptyOverview.clientCntry + "']").attr("selected", true);
                            vm.data.clientCntry($("#sd-clientCntry option[label='" + opptyOverview.clientCntry + "']").attr("value"));
                            vm.data.leadRegion(opptyOverview.region);
                            var apps = opptyOverview.apps.replace("$", "");
                            if (apps !== "") {
                                var appsTcv = Math.floor(parseFloat(apps.split(",").join("")));
                                if (appsTcv > 0) {
                                    vm.data.involvedGbu.apps().inScope(true);
                                    vm.data.involvedGbu.apps().tcv(appsTcv);
                                }
                            }

                            var bps = opptyOverview.bps.replace("$", "");
                            if (bps !== "") {
                                var bpsTcv = Math.floor(parseFloat(bps.split(",").join("")));
                                if (bpsTcv > 0) {
                                    vm.data.involvedGbu.bps().inScope(true);
                                    vm.data.involvedGbu.bps().tcv(bpsTcv);
                                }
                            }

                            var ito = opptyOverview.ito.replace("$", "");
                            if (ito !== "") {
                                var itoTcv = Math.floor(parseFloat(ito.split(",").join("")));
                                if (itoTcv > 0) {
                                    vm.data.involvedGbu.ito().inScope(true);
                                    vm.data.involvedGbu.ito().tcv(itoTcv);
                                }
                            }

                            initNumBox();
                        }
                    });
                } else {
                    if (vm.isNewOppty()) {
                        vm.existedInSystem(true);
                    }
                }
            });
        }
    }

    function opptyData() {
        var data =  {
            opptyID: ko.observable(),
            opptyName: ko.observable(),
            salesStage: ko.observable(),
            opptyType: ko.observable(),
            dealStatus: ko.observable(),
            clientName: ko.observable(),
            opptyTcv: ko.observable(0),
            opptyFyr: ko.observable(0),
            leadBizUnit: ko.observable("ito"),
            involvedGbu: {
                apps: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                bps: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                ess: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                ito: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                hpeOther: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                }),
                hpi: ko.observable({
                    inScope: ko.observable(false),
                    tcv: ko.observable(0),
                    fyr: ko.observable(0)
                })
            },
            contractTerm: ko.observable(0),
            contractSignDate: ko.observable(),
            contractStartDate: ko.observable(),
            pursuitClassfication: ko.observable(),
            solnGovTrack: ko.observable(),
            leadCntry: ko.observable(),
            leadRegion: ko.observable(),
            region: {
                ams: ko.observable(
                {
                    inScope: ko.observable(false)
                }),
                apj: ko.observable(
                {
                    inScope: ko.observable(false)
                }),
                emea: ko.observable(
                {
                    inScope: ko.observable(false)
                })
            },
            clientCntry: ko.observable(),
            pursuitWeb: {
                title: ko.observable(""),
                link: ko.observable(""),
            }
        };

        //define subscribes;
        data.leadCntry.subscribe(updateLeadRegion);
        data.leadRegion.subscribe(updateRegion);
        data.pursuitClassfication.subscribe(function (newValue) {
            if (newValue != "") {
                sectionLoaderViewModel.pursuitClassfication(newValue);
                //update section navigator
                sectionLoaderViewModel.sectionNavigator(requestAPI.createSectionModel(
                    newValue,
                    sectionLoaderViewModel.involvedGbu(),
                    sectionLoaderViewModel.appsInscope()
                ));
            }
        });

        data.involvedGbu.apps().inScope.subscribe(function (inScope) {
            updateInvolvedGbu(inScope, "apps");
            sectionLoaderViewModel.involvedGbu("apps");
            sectionLoaderViewModel.appsInscope(inScope);
            //update section navigator
            sectionLoaderViewModel.sectionNavigator(requestAPI.createSectionModel(
                sectionLoaderViewModel.pursuitClassfication(),
                "apps",
                inScope
            ));
        });
        data.involvedGbu.bps().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "bps") });
        data.involvedGbu.ito().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "ito") });
        data.involvedGbu.ess().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "ess") });
        data.involvedGbu.hpeOther().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "hpeOther") });
        data.involvedGbu.hpi().inScope.subscribe(function (inScope) { updateInvolvedGbu(inScope, "hpi") });

        data.region.apj().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "apj") });
        data.region.ams().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "ams") });
        data.region.emea().inScope.subscribe(function (inScope) { updateGlabalDocument(inScope, "emea") });

        return data;
    }
	
    function cleanBindings() {
        vm.data.opptyName("");
        vm.data.salesStage("");
        vm.data.opptyType("");
        vm.data.dealStatus("");
        vm.data.clientName("");
        vm.data.opptyTcv(0);
        vm.data.opptyFyr(0);
        vm.data.leadBizUnit("ito");
        vm.data.involvedGbu.apps().tcv(0);
        vm.data.involvedGbu.apps().fyr(0);
        vm.data.involvedGbu.apps().inScope(false);
        vm.data.involvedGbu.bps().tcv(0);
        vm.data.involvedGbu.bps().fyr(0);
        vm.data.involvedGbu.bps().inScope(false);
        vm.data.involvedGbu.ito().tcv(0);
        vm.data.involvedGbu.ito().fyr(0);
        vm.data.involvedGbu.ito().inScope(false);
        vm.data.involvedGbu.ess().tcv(0);
        vm.data.involvedGbu.ess().fyr(0);
        vm.data.involvedGbu.ess().inScope(false);
        vm.data.involvedGbu.hpeOther().tcv(0);
        vm.data.involvedGbu.hpeOther().fyr(0);
        vm.data.involvedGbu.hpeOther().inScope(false);
        vm.data.involvedGbu.hpi().tcv(0);
        vm.data.involvedGbu.hpi().fyr(0);
        vm.data.involvedGbu.hpi().inScope(false);
        vm.data.contractTerm(0);
        vm.data.contractSignDate("");
        vm.data.contractStartDate("");
        vm.data.pursuitClassfication("");
        vm.data.solnGovTrack("");
        vm.data.leadCntry("NA");
        vm.data.region.ams().inScope(false);
        vm.data.region.apj().inScope(false);
        vm.data.region.emea().inScope(false);

        vm.data.leadRegion("NA");

        vm.data.clientCntry("NA");
        vm.data.pursuitWeb.title("");
        vm.data.pursuitWeb.link("");

        initNumBox();
    }
      
    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var opptyViewModel = function (json) {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "opportunity-data",
            };
            //define observables
            self.isNewOppty = ko.observable(false);
            self.existedInSystem = ko.observable(false);
            self.existedInSalesForce = ko.observable(true);
            self.contractSignDateString = "";
            self.data = new opptyData();

            self.editable = ko.observable(true);
            //define subscriptions
            self.inputOpptyId = ko.observable();
            self.inputOpptyId.subscribe(checkOpptyId);
            self.leadCntryName = ko.observable();
            self.clientCntryName = ko.observable();
            self.salesStageName = ko.observable();

            self.validId = ko.observable();
            //define functions
            self.loadGrip = function () {
                checkOpptyId();
            }
        }

        vm = new opptyViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function validateTcvAndFyr(vm) {
        //if type tcv value is empty string,we replace it with number 0;
        if (vm.data.opptyTcv() === "") {
            vm.data.opptyTcv(0);
        }
        if (vm.data.opptyFyr() === "") {
            vm.data.opptyFyr(0);
        }
        var gbu = ko.toJS(vm.data.involvedGbu);
        for (var unit in gbu) {
            if (gbu[unit].tcv === "") {
                vm.data.involvedGbu[unit]().tcv(0);
            }
            if (gbu[unit].fyr === "") {
                vm.data.involvedGbu[unit]().fyr(0);
            }
        }
    }

    function checkOpptyId(inputOpptyId) {
        //clean bindings and check input oppty id;
        cleanBindings();
        if (inputOpptyId != "" && checkIdFormat(inputOpptyId)) {
            vm.validId(true);
            loadGripData(inputOpptyId);
        } else {
            vm.validId(false);
        }
    }

    function checkIdFormat(opptyId) {
        // opportunity format should be OPP-1234567890 or OPE-1234567890
        var regx = /^OP[PE]-\d{10}$/;
        var rs = regx.test(opptyId);
        if (regx.test(opptyId)) {
            return true;
        } else {
            alert("Please check the opportunity format");
            return false;
        }
    }

    function checkRequiredField() {
        // check the required fields
        if (vm.isNewOppty()) {
            vm.data.opptyID(vm.inputOpptyId());
        }
        if (vm.data.opptyID() !== "" && vm.data.salesStage() !== "" && vm.data.clientName() !== "" && vm.data.opptyType() !== "" && vm.data.pursuitClassfication() !== "NA" && (vm.data.region.ams().inScope() || vm.data.region.apj().inScope() || vm.data.region.emea().inScope())) {
            return true;
        } else {
            alert("Please check the required fields");
            return false;
        }
    }

    function compareFryAndTcv() {
        //ensure that TCV is larger than FYR
        validateTcvAndFyr(vm);
        var isValid = true;
        var gbu = ko.toJS(vm.data.involvedGbu);
        if (parseInt(vm.data.opptyTcv()) < parseInt(vm.data.opptyFyr())) {
            isValid = false;
        }
        for (var unit in gbu) {
            if (parseInt(gbu[unit].tcv) < parseInt(gbu[unit].fyr)) {
                isValid = false;
                break;
            }
        }
        if (!isValid) {
            alert("Please ensure that TCV is larger than FYR !");
        }
        initNumBox();
        return isValid;
    }

    function verifyOpptyTcvAndOpptyFyr(vm) {
        //The Opportunity TCV should be equal to the combined total of all GBU TCV. 
        //The Opportunity FYR should be equal to the combined total of all GBU FYR.
        var gbu = ko.toJS(vm.data.involvedGbu);
        var opptyTcv = 0;  
        var opptyFyr = 0;
        if (vm.data.opptyTcv() !== "") {
            opptyTcv = parseInt(vm.data.opptyTcv());
        }
        if (vm.data.opptyFyr() !== "") {
            opptyFyr = parseInt(vm.data.opptyFyr());
        }
        
        for (var unit in gbu) {
            if (gbu[unit].tcv !== "") {
                opptyTcv -= parseInt(gbu[unit].tcv);
            }
            if (gbu[unit].fyr !== "") {
                opptyFyr -= parseInt(gbu[unit].fyr);
            }
        }
        if (opptyTcv === 0 && opptyFyr === 0) {
            return true;
        } else {
            return false;
        }
    }

    function checkContractDate() {
        // ensure that Contract sign date must be before or equal to contract start date;
        if (vm.data.contractSignDate() !== "" && vm.data.contractStartDate() !== "" && vm.data.contractSignDate() !== undefined && vm.data.contractStartDate() !== undefined) {
            var signDate = new Date(vm.data.contractSignDate()).format("MMM d yyyy");
            var startDate = new Date(vm.data.contractStartDate()).format("MMM d yyyy");
            if (Date.parse(signDate) < Date.parse(startDate) || Date.parse(signDate) === Date.parse(startDate)) {
                return true;
            } else {
                alert("Contract sign date must be before or equal to contract start date !");
                return false;
            }
        } else if (vm.data.contractStartDate() === "" || vm.data.contractStartDate() === undefined) {
            return true;
        } else{
            alert("Contract sign date must be before or equal to contract start date !");
            return false;
        }
    }

	return {
		name: ["Section0201", "sd-section-0201"],
		template: templateHtml,
		viewModel: {
			createViewModel: createViewModel
		},
		subComponents: [dateTimePicker, inputText, dollarFormatter]
	};
});








