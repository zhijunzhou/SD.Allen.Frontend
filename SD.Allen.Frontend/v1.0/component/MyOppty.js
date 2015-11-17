/*global define, alert, console, location*/
define('component/MyOppty', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./MyOpptyTemplate.html"),
        TopLink = require("./TopLink"),
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/Oppty');

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
        getMyOppties(viewModel);
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel,
            myOpptyViewModel = function () {
                var self = this;
                self.urlPrefix = appConfig.ENV.SDContentsUrl + "?OpptyID=";
                self.opptyList = ko.observable();
            };
        viewModel = new myOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getMyOppties(viewModel) {
        var vm = viewModel;
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            vm.opptyList(oppties);
            //loading table data after get oppties
            loadDataTables();
        });
    }

    return {
        name: ["MyOppty", "sd-myoppty"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };
});

