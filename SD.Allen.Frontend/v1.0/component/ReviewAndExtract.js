define('component/ReviewAndExtract', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        TopLink = require("./TopLink"),
        appConfig = require('model/AppConfig'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./ReviewAndExtractTemplate.html"),
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
        viewModel = {};

    function addSDLinkAfterAppHome() {
        appUtility.addSDLinkAfterAppHome();
    }

    function onViewModelPreLoad() {
       
        $('.navmenu').offcanvas({
            autohide: false,
            recalc: false,
            toggle: false,
            canvas: '#sd-section-detail'
        });       
    }

    function onViewModelLoad(viewModel) {
        //getAllAttachments();
    }

    function getAllAttachments() {
        console.log(viewModel.opptyID);
        requestAPI.getAllAttachments(viewModel.opptyID()).done(function (data) {
            var filelist = data.d.results;
            for (var i in filelist) {
                
            }
        });
    }

    function loadingDocument(viewModel) {
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        if (viewModel.opptyID() === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getOpptyByIDSync(viewModel.opptyID()).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status >= 400) {
                    requestAPI.errorOppty('' + oppty.status);
                } else {
                    if (oppty.data != undefined && oppty.data != null) {
                        viewModel.document(oppty.data);
                        var data = oppty.data.opptyOverview.opptyData.data;
                        viewModel.pursuitClassfication(data.pursuitClassfication);
                        if (data.involvedGbu != null && data.involvedGbu.apps != null) {
                            viewModel.involvedGbu('apps');
                            viewModel.appsInscope(data.involvedGbu.apps.inScope);
                        }
                        viewModel.sectionNavigator(requestAPI.createSectionModel(viewModel.pursuitClassfication(), viewModel.involvedGbu(), viewModel.appsInscope()));
                    }
                }
            });
            //getAllAttachments();//get all attachment
        }

    }

    function createViewModel(params, componentInfo) {
        addSDLinkAfterAppHome();
        onViewModelPreLoad();
        var reviewAndExtractviewModel = function (params, componentInfo) {
            var self = this;
            self.document = ko.observable();// the entire document
            self.editable = ko.observable(false);
            self.opptyID = ko.observable();

            self.sdContentUrl = appConfig.ENV.SDContentsUrl;

            //control section's or some field's visibility
            self.pursuitClassfication = ko.observable();
            self.sectionNavigator = ko.observable();
            //gbu is apps
            self.involvedGbu = ko.observable();
            self.appsInscope = ko.observable();

            loadingDocument(self);

            self.toggleLeftMenu = function (e) {
                //e.preventDefault();
                //$('.navmenu').offcanvas('toggle');
                //$('.navmenu').canvas('sd-section-detail');
            };

            $('#sd-section-navbtn').click(function (e) {
                requestAPI.FixWorkspace();
                e.preventDefault();
                //return false;
            });

            $('a').on('click', function () {
                var href = $(this).attr('href');                
                requestAPI.FixWorkspace();
            });
            self.scrollTop = function () {
                $("html, body").animate({ scrollTop: 0 }, "slow");
                return false;
            }
        };
        viewModel = new reviewAndExtractviewModel(params, componentInfo);
        onViewModelLoad(viewModel);
        return viewModel;
    }

    return {
        name: ["ReviewAndExtract", "sd-review-extract"],
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
            TopLink
        ]
    };

});