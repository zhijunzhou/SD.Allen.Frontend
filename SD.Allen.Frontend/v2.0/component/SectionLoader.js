/*global define, alert, console, location*/
define("component/SectionLoader", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        requestAPI = require('model/RequestAPI'),
        TopLink = require("./TopLink"),
        templateHtml = require("text!./SectionLoaderTemplate.html"),
        section0201 = require('./Section0201'),
        section0202 = require('./Section0202'),
        section0301 = require('./Section0301'),
        section030201 = require('./Section030201'),
        section030202 = require('./Section030202'),
        section030203 = require('./Section030203'),
        section030204 = require('./Section030204'),
        section040101 = require('./Section040101'),
        section040102 = require('./Section040102'),
        section0402 = require('./Section0402'),
        section040301 = require('./Section040301'),
        section040302 = require('./Section040302'),
        section040303 = require('./Section040303'),
        section040304 = require('./Section040304'),
        section040305 = require('./Section040305'),
        section040306 = require('./Section040306'),
        section040307 = require('./Section040307'),
        section0404 = require('./Section0404'),
        section040501 = require('./Section040501'),
        section040502 = require('./Section040502'),
        section040503 = require('./Section040503'),
        section040504 = require('./Section040504'),
        section040505 = require('./Section040505'),
        section040506 = require('./Section040506'),
        section0406 = require('./Section0406'),
        section0407 = require('./Section0407'),

        section0701 = require('./Section0701'),
        section0702 = require('./Section0702'),
        section0703 = require('./Section0703'),
        section0704 = require('./Section0704'),
        section0705 = require('./Section0705'),
        section0706 = require('./Section0706'),
        section0707 = require('./Section0707'),

        section0801 = require('./Section0801'),
        section0802 = require('./Section0802'),
        section0803 = require('./Section0803'),
        appUtility = require('util/AppUtility'),
        saveCompleted = true,
        saveingSid = "",
        sectionModel = {},
        eTag = "",
        viewModel = {};

    function listenCustomEvent() {
        $(window).on('generateMsg', function (e, secName, error, updateMsg) {
            $('.sd-update-message').text(updateMsg);
            if (error == 0) {
                $('.sd-update-message').addClass('text-success');
                setTimeout(function () {
                    $('.sd-update-message').removeClass('text-success');
                    $('.sd-update-message').text('');
                }, 3000);
            } else {
                $('.sd-update-message').addClass('text-danger');
                setTimeout(function () {
                    $('.sd-update-message').removeClass('text-danger');
                    $('.sd-update-message').text('');
                }, 5000);
            }
            saveCompleted = true;
        });
        $(window).off('submitableChanged');
        $(window).on('submitableChanged', function (e, argu) {
            saveCompleted = argu.submitFlag;
            if (saveCompleted) {
                sp.app.workingDialog.show("Saving section");
                requestAPI.updateSection(argu.viewModel.opptyID(), argu.viewModel.sectionName(), argu.obj, eTag).done(function (data, textStatus, jqXHR) {
                    sp.app.workingDialog.hide("Saving section");
                    if (jqXHR != undefined && saveingSid == argu.viewModel.sid()) {
                        eTag = jqXHR.getResponseHeader('ETag');
                    } else {
                        if (jqXHR === undefined) {
                            requestAPI.errorUpdateSection(data, argu.viewModel.sid(), argu.viewModel.opptyID());
                            sp.app.workingDialog.show("Save section failed");
                            setTimeout(function () {
                                sp.app.workingDialog.hide("Save section failed")
                            }, 3000);
                            if (data.status == 409) {
                                if (confirm("Your current data is now up-to-date, maybe someone have already saved this section!\n Do you want to load the lastest data?")) {
                                    window.location.reload(true);
                                }
                            }
                        } else {
                            updateViewModel(argu.viewModel);
                            history.pushState("string-data", "section-name", "?sid=" + saveingSid + "&OpptyID=" + argu.viewModel.opptyID() + "")
                        }
                    }

                });
            }
        });
    }

    function updateViewModel(argu) {
        argu.sid(saveingSid);
        $(window).trigger('updateSection', argu);
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });
    }

    function onViewModelLoad(viewModel) {
        var sid = appUtility.getUrlParameter('sid');
        saveingSid = sid;
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        viewModel.sid(sid);
        if (viewModel.opptyID() === "") {
            if (sid == '') {
                requestAPI.errorOppty('404');
            } else if (sid == '0201') {
                //create oppty
            } else {
                viewModel.sectionNavigator(requestAPI.createSectionModel());
            }
        } else {
            viewModel.sectionNavigator(requestAPI.createSectionModel());
        }
        $('body').show();
    }

    function retriveDocument(viewModel) {
        if (viewModel.opptyID() != "") {
            sp.app.workingDialog.show("Retrieving Section " + viewModel.title());
            requestAPI.getSectionByIDAndSectionNameAsync(viewModel.opptyID(), viewModel.sectionName()).done(function (oppty, xhr) {
                sp.app.workingDialog.hide("Retrieving Section " + viewModel.title());
                if (oppty.status != undefined && oppty.status >= 400) {
                    requestAPI.errorOppty('404');
                } else {
                    if (oppty.data.opptyOverview != null && oppty.data.opptyOverview.opptyData != null) {
                        var data = oppty.data.opptyOverview.opptyData.data;
                        eTag = xhr.getResponseHeader('ETag');
                        viewModel.document(oppty.data);
                        viewModel.oppty.ClientName(data.clientName);
                        viewModel.oppty.OpptyName(data.opptyName);
                        viewModel.pursuitClassfication(data.pursuitClassfication);
                        if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                            viewModel.involvedGbu('apps');
                            viewModel.appsInscope(data.involvedGbu.apps.inScope);
                        }
                        sectionModel = requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope());
                        viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));

                        $(window).trigger('updateSection', viewModel);
                    }
                }

            });
        }
    }

    function isNewSection(sid) {
        var newSections = ["0701","0702","0703","0704","0705","0706","0707","0801","0802","0803"]
        for (var i in newSections) {
            if (sid == newSections[i])
                return true;
        }
        return false;
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionModel = requestAPI.createSectionModel('C', 'apps', true);
        var sectionViewModel = function () {
            var self = this;
            self.oppty = {
                OpptyName: ko.observable(""),
                ClientName: ko.observable("")
            };

            self.document = ko.observable();// the entire document
            //self.eTag = ko.observable();            
            self.sectionNavigator = ko.observable(requestAPI.createSectionModel('C', 'apps', true));//section navigator model

            self.opptyID = ko.observable();
            self.sdLoaderUrl = sp.app.config.ENV.SectionLoaderUrl;
            self.sdContentUrl = sp.app.config.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();

            self.editable = ko.observable(true);
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            self.sid = ko.observable();
            self.title = ko.observable();
            self.sectionName = ko.observable();
            self.prevSid = ko.observable();
            self.nextSid = ko.observable();

            self.sid.subscribe(function (newSid) {
                for (var i in self.sectionNavigator()) {
                    if (self.sectionNavigator()[i].sid === self.sid()) {
                        self.title(self.sectionNavigator()[i].title);
                        self.sectionName(self.sectionNavigator()[i].sectionName);
                        self.prevSid(self.sectionNavigator()[i].prevSid);
                        self.nextSid(self.sectionNavigator()[i].nextSid);
                        if (!isNewSection(newSid)) {
                            retriveDocument(viewModel);
                        }                        
                        return;
                    }
                }
            });

            self.pursuitClassfication.subscribe(function (newValue) {
                viewModel.pursuitClassfication(newValue);
            });

            self.involvedGbu.subscribe(function (newValue) {
                viewModel.involvedGbu(newValue);
            });

            self.appsInscope.subscribe(function (newValue) {
                viewModel.appsInscope(newValue);
            });

            self.saveHome = function () {

            }

            
            self.save = function () {
                beforeSave();
                $(window).triggerHandler("opptySaving", self);
            }
            self.saveAndNext = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        saveingSid = self.nextSid();
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }
                } else if (isNewSection(viewModel.sid())) {
                    viewModel.sid(self.nextSid());
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    saveingSid = self.nextSid();
                }
            }
            self.saveAndPrevious = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        saveingSid = self.prevSid();
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }
                } else if(isNewSection(viewModel.sid())) {
                    viewModel.sid(self.prevSid());
                } else{
                    $(window).triggerHandler("opptySaving", viewModel);
                    saveingSid = self.prevSid();
                }
            }
            self.changeSection = function (sid) {
                beforeSave();
                $(window).triggerHandler("opptySaving", viewModel);
                saveingSid = sid;
            }
        },
        viewModel = new sectionViewModel();
        onViewModelLoad(viewModel);
        return viewModel;
    }

    function afterSave() {
        saveCompleted = true;
    }

    function beforeSave() {
        hidePopover();
    }

    function hidePopover() {
        $('.popover').popover('hide');
        $('.popover').remove();
    }

    return {
        name: ["SectionLoader", "sd-section-loader"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [
            section0201,
            section0202,
            section0301,
            section030201,
            section030202,
            section030203,
            section030204,
            section040101,
            section040102,
            section0402,
            section040301,
            section040302,
            section040303,
            section040304,
            section040305,
            section040306,
            section040307,
            section0404,
            section040501,
            section040502,
            section040503,
            section040504,
            section040505,
            section040506,
            section0406,
            section0407,

            section0701,
            section0702,
            section0703,
            section0704,
            section0705,
            section0706,
            section0707,

            section0801,
            section0802,
            section0803,
            TopLink
        ]
    };
});