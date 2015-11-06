/*global define, alert, location*/
define('component/Section0201', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dateTimePicker = require('./DateTimePicker'),
        templateHtml = require("text!./Section0201Template.html"),
        appUtility = require('util/AppUtility'),
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty'),
        inputText = require('./SDInputText'),
        numBox = require('numBox'),
        requestAPI = require('model/RequestAPI'),
        //dollarFormatter = require('./DollarFormatter'),
        vm = {},
        sectionLoaderViewModel = {};

    var dropdownCollection = {
        salesStage: [
            new Map("01", "01 - Understand the Client"),
            new Map("02", "02 - Validate Opportunity"),
            new Map("03", "03 - Qualify Opportunity"),
            new Map("04", "04 - Develop & Propose Solution"),
            new Map("05", "05 - Negotiate & Close"),
            new Map("06", "06 - Won & Deploy")
        ],
        opptyType: [
            new Map("New Business", "New Business"),
            new Map("UpSell", "UpSell"),
            new Map("Renewal", "Renewal"),
            new Tree("Other", [
                new Map("Add-On", "Add-On"),
                new Map("CrossSell / UpSell", "CrossSell / UpSell"),
                new Map("Defend", "Defend"),
                new Map("Indefinite Delivery/Quantity", "Indefinite Delivery/Quantity"),
                new Map("N/A", "N/A"),
                new Map("Parent", "Parent"),
                new Map("Project", "Project"),
                new Map("Renegotiation", "Renegotiation"),
                new Map("Resell", "Resell"),
                new Map("Run Rate", "Run Rate"),
                new Map("Scope Change", "Scope Change"),
                new Map("Term Contract", "Term Contract"),
                new Map("Upsell", "Upsell"),
                new Map("VolumeGrowth", "VolumeGrowth"),
                new Map("WinBack", "WinBack")
            ])
        ],
        dealStatus: [
            new Map("Open", "Open"),
            new Map("Won", "Won"),
            new Map("Lost", "Lost"),
            new Map("Lost", "Lost"),
            new Map("No Opportunity", "No Opportunity"),
            new Map("Not Awarded", "Not Awarded"),
            new Map("HPE Cancelled", "HPE Cancelled")
        ],
        leadBizUnit: [
            new Map("apps", "APPS"),
            new Map("bps", "BPS"),
            new Map("ess", "Enterprise Security Practice"),
            new Map("ito", "ITO"),
            new Map("hpeOther", "Other HPE"),
            new Map("hpi", "HP Inc.")
        ],
        pursuitClassfication: [
            new Map("A", "A"),
            new Map("B","B"),
            new Map("C","C"),
            new Map("D","D")
        ],
        solnGovTrack: [
            new Map("Focused", "Focused"),
            new Map("Fast", "Fast"),
            new Map("Account", "Account"),
            new Map("Not Applicable", "Not Applicable")
        ],
        countries: [
            new Tree("AMS", [
                new Map("AR","Argentina"),
                new Map("BR","Brazil"),
                new Map("CA","Canada"),
                new Map("CL","Chile"),
                new Map("CO","Colombia"),
                new Map("CR","Costa Rica"),
                new Map("MX","Mexico"),
                new Map("OtherAMS","Other AMS"),
                new Map("PA","Panama"),
                new Map("PE","Peru"),
                new Map("US","United States")
            ]),
            new Tree("APJ", [
                new Map("AU","Australia"),
                new Map("CN","China"),
                new Map("HK","Hong Kong"),
                new Map("IN","India"),
                new Map("ID","Indonesia"),
                new Map("JP","Japan"),
                new Map("KR","Korea"),
                new Map("MY","Malaysia"),
                new Map("NZ","New Zealand"),
                new Map("OtherAPJ","Other APJ"),
                new Map("PH","Philippines"),
                new Map("SG","Singapore"),
                new Map("TW","Taiwan"),
                new Map("TH","Thailand"),
                new Map("VN","Vietnam"),
            ]),
            new Tree("EMEA", [
                new Map("AT","Austria"),
                new Map("BE","Belgium"),
                new Map("BG","Bulgaria"),
                new Map("CZ","Czech Republic"),
                new Map("DK","Denmark"),
                new Map("EG","Egypt"),
                new Map("FI","Finland"),
                new Map("FR","France"),
                new Map("DE","Germany"),
                new Map("GR","Greece"),
                new Map("HU","Hungary"),
                new Map("IE","Ireland"),
                new Map("IL","Israel"),
                new Map("IT","Italy"),
                new Map("LU","Luxembourg"),
                new Map("NL","Netherlands"),
                new Map("NO","Norway"),
                new Map("OtherEMEA","Other EMEA"),
                new Map("PL","Poland"),
                new Map("PT","Portugal"),
                new Map("RO","Romania"),
                new Map("RU","Russia"),
                new Map("SA","Saudi Arabia"),
                new Map("ZA","South Africa"),
                new Map("ES","Spain"),
                new Map("SE","Sweden"),
                new Map("CH","Switzerland"),
                new Map("TR","Turkey"),
                new Map("AE","UAE"),
                new Map("GB","United Kingdom"),
            ])
        ],
        sector: [
            new Map("Commercial Non Binding", "Commercial Non Binding"),
            new Map("Commercial Binding", "Commercial Binding"),
            new Map("Public Sector", "Public Sector")
        ]
    };

    function Map(key, value) {
        return { key: key, value: value };
    }

    function Tree(label, mapList) {
        return {
            label: label,
            mapList:mapList
        }
    }

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        initNumBox();
        $(document).ready(function () {
            // $('.inputUSD').NumBox({ symbol: "$", max: Math.pow(10, 20), min: 0 });
        });
        //$('.inputUSD').getFormatted();
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
            loadOpptyData(vm.section.opptyID);
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
        } else {
            vm.data.leadRegion(region);
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

    function saveOppty(event, argu) {
        if (checkRequiredField() === true && checkIdFormat(vm.data.opptyID()) === true && checkContractDate() === true && compareFryAndTcv() === true) {
            $(window).triggerHandler("submitableChanged", true);
            var sid = argu.sid();
            if (sid !== '0201') {
                return;
            }
            if (vm.isNewOppty()) {
                requestAPI.createOpptyDocument(ko.toJS(vm.data)).done(function (data) {
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    if (data != undefined && data.status == undefined) {
                        sid = "0202";
                        window.location.href = appConfig.ENV.SectionLoaderUrl + "?sid=" + sid + "&OpptyID=" + vm.data.opptyID();
                    }
                });
            } else {
                vm.data.pursuitWeb.link(vm.data.pursuitWeb.link());
                requestAPI.updateSection(vm.section.opptyID, vm.section.name, ko.toJS(vm.data), vm.section.eTag).done(function (data, textStatus, jqXHR) {
                    if (jqXHR != undefined)  vm.section.eTag = jqXHR.getResponseHeader('ETag');
                    requestAPI.errorUpdateSection(data, sid, vm.section.opptyID);
                    //update top oppty info
                    sectionLoaderViewModel.oppty.OpptyName(vm.data.opptyName());
                    sectionLoaderViewModel.oppty.ClientName(vm.data.clientName());
                });
            }
        } else {
            $(window).triggerHandler("submitableChanged", false);
        }
    }

    function loadOpptyData(opptyID) {
        requestAPI.getSectionByIDAndSectionNameAsync(opptyID, vm.section.name).done(function (oppty,xhr) {
            if (oppty.data === undefined) {
                vm.data.opptyID(opptyID);
            } else {
                vm.section.eTag = xhr.getResponseHeader('ETag');
                var data = oppty.data.opptyOverview.opptyData.data;
                vm.data.opptyID(data.opptyId);
                vm.data.opptyName(data.opptyName);
                vm.data.salesStage(data.salesStage);

                //escope the spacing;
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
        }).then(function (oppty) {
            //query sales force
        });
    }

    function loadGripData(opptyID) {
        if (opptyID !== undefined && opptyID !== "") {
            requestAPI.getOpptyByIDAsync(opptyID).done(function (xhr) {
                if (xhr.status == "404") {
                    vm.existedInSystem(false);
                    vm.isNewOppty(true);
                    opptyModel.getOpptyOverviewAsync(opptyID).done(function (opptyOverview) {
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
            //self.data.opptyID.subscribe(loadGripData);
            self.inputOpptyId = ko.observable();
            self.inputOpptyId.subscribe(checkOpptyId);
            //self.data.leadBizUnit.subscribe(updateLeadGBU);
            self.leadCntryName = ko.observable();
            self.clientCntryName = ko.observable();
            self.salesStageName = ko.observable();
            //define dropdown list observable
            self.salesStageAvailable = dropdownCollection.salesStage;
            self.opptyTypeAvailable = dropdownCollection.opptyType;
            self.dealStatusAvailable = dropdownCollection.dealStatus;
            self.leadBizUnitAvailable = dropdownCollection.leadBizUnit;
            self.pursuitClassficationAvailable = dropdownCollection.pursuitClassfication;
            self.solnGovTrackAvailable = dropdownCollection.solnGovTrack;
            self.countriesAvailable = dropdownCollection.countries;
            self.sectorAvailable = dropdownCollection.sector;

            self.validId = ko.observable();
            //define functions
            self.loadGrip = function () {
                checkOpptyId();
            }
        }

        vm = new opptyViewModel(params);
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        vm.editable(sectionLoaderViewModel.editable());
        onViewModelLoaded();
        return vm;
    }

    function validateTcvOrFyr() {
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
        //vm.data = new opptyData();
        //var opptyOvewviewSection = document.getElementById("sd-section-0201");
        //ko.cleanNode(opptyOvewviewSection);
        //ko.applyBindings(createViewModel(sectionLoaderParams));
        cleanBindings();
        if (inputOpptyId != "" && checkIdFormat(inputOpptyId)) {
            vm.validId(true);
            loadGripData(inputOpptyId);
        } else {
            vm.validId(false);
        }
    }

    function checkIdFormat(opptyId) {
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
        validateTcvOrFyr();
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

    function checkContractDate() {
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
		subComponents: [dateTimePicker, inputText]
	};
});








