/*global define, alert, console, location*/
define("component/AllOppty", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AllOpptyTemplate.html"),
        opptyModel = require('model/Oppty'),
        TopLink = require("./TopLink"),
        appConfig = require('model/AppConfig'),
        viewModel = {};

    function loadDataTables() {
        $('#table_sorting_paging').dataTable(
                {                    
                    'retrieve': true,
                    'paging': false,
                    dom: 'T<"clear">lfrtip'
                }
           )
    }

    function onViewModelPreLoad() {       
    }

    function onViewModelLoaded(viewModel) {
        getAllOppties(viewModel);
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var allOpptyViewModel = function () {
            var self = this;
            self.urlPrefix = appConfig.ENV.SDContentsUrl + "?OpptyID=";
            self.opptyList = ko.observable();
        };
        viewModel = new allOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getAllOppties(viewModel) {
        var vm = viewModel;
        requestAPI.getAllOpptyAsync().done(function (oppties) {
            vm.opptyList(oppties);
            //loading table data after get oppties
            loadDataTables();
        });
    }
    return {
        name: ["AllOppty", "sd-alloppty"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };
});

