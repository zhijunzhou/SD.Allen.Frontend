/*global define, alert, console, location*/
define('component/SDContents', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./SDContentsTemplate.html"),
        TopLink = require("./TopLink"),
        appUtility = require('util/AppUtility'),
        requestAPI = require('model/RequestAPI'),
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty'),
        TopLinkHome = require("./TopLinkHome"),
        OpptyID = require("./OpptyID"),
        vm = {};

    function onViewModelPreLoad() {
        $('#s4-ribbonrow').hide();
        $('#s4-titlerow').hide();
    }

    function onViewModelLoaded(viewModel) {
        vm.opptyID(appUtility.getUrlParameter('OpptyID'));
        if (vm.opptyID() === "") {
            requestAPI.errorOppty('400');
        } else {
            requestAPI.getOpptyByIDAsync(vm.opptyID()).done(function (oppty, xhr) {
                //query system
                if (oppty.status != undefined && oppty.status == 404) {
                    requestAPI.errorOppty('404');
                } else {
                    var data = oppty.data.opptyOverview.opptyData.data;
                    vm.opptyID(data.opptyId);
                    vm.opptyName(data.opptyName);
                }
            });
        }
    }

    function createSDContentsViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var sdContentViewModel = function () {
            var self = this;
            self.opptyID = ko.observable();
            self.opptyName = ko.observable();
            self.sdLoaderUrl = appConfig.ENV.SectionLoaderUrl;
        };
        vm = new sdContentViewModel(params);
        onViewModelLoaded(vm);
        return vm;
    }

    return {
        name: "SDContents",
        template: templateHtml,
        viewModel: {
            createViewModel: createSDContentsViewModel
        },
        subComponents: [TopLink, OpptyID]
    };

});