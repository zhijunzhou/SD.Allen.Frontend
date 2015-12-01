/*global define, alert, console, location*/
define("component/AllOppty", function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./AllOpptyTemplate.html"),
        TopLink = require("./TopLink"),
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
        $("body").show();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var allOpptyViewModel = function () {
            var self = this;
            self.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
            self.opptyList = ko.observable();
        };
        viewModel = new allOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getAllOppties(viewModel) {
        var vm = viewModel;
        sp.app.workingDialog.show("Retrieving All Opportunities..");
        requestAPI.getAllOpptyAsync().done(function (oppties) {
            vm.opptyList(oppties);
            sp.app.workingDialog.hide("Retrieving All Opportunities..");
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

