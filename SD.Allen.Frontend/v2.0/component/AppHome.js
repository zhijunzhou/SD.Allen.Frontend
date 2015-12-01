/* global define */
define('component/AppHome', function (require) {
    "use strict";
    
    var $ = require("jquery"),
        ko = require("knockout"),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AppHomeTemplate.html"),
        TopLink = require("./TopLinkHome");
    
    function onViewModelPreLoad() { }

    function onViewModelLoaded(viewModel) {
        $("body").show();
        loadTop5Oppties(viewModel);
    }

    function loadTop5Oppties(viewModel) {
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            viewModel.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
            viewModel.opptyList(oppties);
        });
    }
    
    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        $("body").show();
        var viewModel,
            appHomeViewModel = function (params) {
                var self = this;
                self.opptyList = ko.observable();
        }
        viewModel = new appHomeViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    return {
        name: "AppHome",
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };

});