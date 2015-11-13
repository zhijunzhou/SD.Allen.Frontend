/*global define, alert, console, location*/
define("component/SectionLoader", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        opptyModel = require('model/Oppty'),
        requestAPI = require('model/RequestAPI'),
        appConfig = require('model/AppConfig'),
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
        appUtility = require('util/AppUtility'),
        timeInterval = 0,
        saveCompleted = true,
        eTag = "",
        sectionModel = {},
        viewModel = {};

    function addSDLinkAfterAppHome() {
        appUtility.addSDLinkAfterAppHome();
    }

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
        $(window).on('submitableChanged', function (e, receiveData) {
            saveCompleted = receiveData.submitFlag;
            
            requestAPI.updateSection(receiveData.opptyID, receiveData.sectionName, receiveData.obj, receiveData.eTag).done(function (data, textStatus, jqXHR) {
                if (jqXHR != undefined)
                    eTag = jqXHR.getResponseHeader('ETag');
                requestAPI.errorUpdateSection(data, receiveData.sid, receiveData.opptyID);
            });
        });
    }

    function showMsg(event,data) {
        console.log(data);
    }

    function onViewModelPreLoad() {
        addSDLinkAfterAppHome();
        listenCustomEvent();

        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });
    }

    function loadingDocument() {

    }

    function onViewModelLoad(viewModel) {
        var sid = appUtility.getUrlParameter('sid');
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        viewModel.sid(sid);
        if (viewModel.opptyID() === "") {

        } else {
            viewModel.sectionNavigator(requestAPI.createSectionModel());
            viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
            retriveDocument(viewModel);
       }
    
    }

    function retriveDocument(viewModel) {
        console.log(viewModel);
        requestAPI.getSectionByIDAndSectionNameSync(viewModel.opptyID(), viewModel.sectionName()).done(function (oppty, xhr) {
            //query system
            if (oppty.status != undefined && oppty.status >= 400) {
                requestAPI.errorOppty('404');
            } else {
                if (oppty.data.opptyOverview != null && oppty.data.opptyOverview.opptyData != null) {
                    var data = oppty.data.opptyOverview.opptyData.data;
                    viewModel.document(oppty.data);
                    viewModel.eTag(xhr.getResponseHeader('ETag'));
                    viewModel.oppty.ClientName(data.clientName);
                    viewModel.oppty.OpptyName(data.opptyName);
                    viewModel.pursuitClassfication(data.pursuitClassfication);
                    if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                        viewModel.involvedGbu('apps');
                        viewModel.appsInscope(data.involvedGbu.apps.inScope);
                    }
                    sectionModel = requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope());
                    viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));
                }
            }
        });
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        sectionModel = requestAPI.createSectionModel('C', 'apps', true);
        var sectionViewModel = function (){
            var self = this;
            self.oppty = {
                ID: "",
                OpptyName: ko.observable(""),
                ClientName: ko.observable(""),
                pursuitClassfication : ko.observable()
            };

            self.document = ko.observable();// the entire document
            self.eTag = ko.observable();
            self.sectionName = ko.observable();
            self.sectionNavigator = ko.observable(requestAPI.createSectionModel('C', 'apps', true));//section navigator model

            self.opptyID = ko.observable();
            self.sdLoaderUrl = appConfig.ENV.SectionLoaderUrl;
            self.sdContentUrl = appConfig.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();

            self.editable = ko.observable(true);
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            self.sid = ko.observable();
            self.title = ko.observable();
            self.prevSid = ko.observable();
            self.nextSid = ko.observable();

            self.sid.subscribe(function (newSid){
                for (var i in self.sectionNavigator()) {
                    if (self.sectionNavigator()[i].sid === self.sid()) {
                        self.title(self.sectionNavigator()[i].title);
                        self.prevSid(self.sectionNavigator()[i].prevSid);
                        self.nextSid(self.sectionNavigator()[i].nextSid);
                        return;
                    }
                }
            });
            self.saveHome = function () {
                //$('[name="sd-save-section"]').attr('sd-sid', '00').click();                
            }
            self.save = function () {
                beforeSave();
                $(window).triggerHandler("opptySaving", self);                
                //afterSave(viewModel.sid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.saveAndNext = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        viewModel.sid('' + self.nextSid());                        
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }                    
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    viewModel.sid('' + self.nextSid());
                    $(window).triggerHandler("sectionChanged", viewModel);
                }
                //afterSave(viewModel.nextSid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.saveAndPrevious = function () {
                beforeSave();
                if (viewModel.sid() == '0201' || viewModel.sid() == '0202') {
                    $(window).triggerHandler("opptySaving", viewModel);
                    if (saveCompleted) {
                        viewModel.sid('' + self.prevSid());
                        $(window).triggerHandler("sectionChanged", viewModel);
                    }
                } else {
                    $(window).triggerHandler("opptySaving", viewModel);
                    viewModel.sid('' + self.prevSid());
                    $(window).triggerHandler("sectionChanged", viewModel);
                }
                //afterSave(viewModel.prevSid());
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
            }
            self.changeSection = function (sid) {
                beforeSave();
                $(window).triggerHandler("opptySaving", viewModel);
                viewModel.sid(sid);
                //afterSave(sid);
                viewModel.sectionName(requestAPI.getSectionNameBySid(viewModel.sectionNavigator(), viewModel.sid()));
                retriveDocument(viewModel);
                $(window).triggerHandler("sectionChanged", viewModel);
            }
        },
        viewModel = new sectionViewModel();
        onViewModelLoad(viewModel);
        return viewModel;
    }

    function afterSave(sid) {
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
            section0407
        ]
    };
});