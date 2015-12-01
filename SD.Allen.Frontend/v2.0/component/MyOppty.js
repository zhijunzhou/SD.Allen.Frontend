/*global define, alert, console, location*/
define('component/MyOppty', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        dataTables = require('dataTables'),
        requestAPI = require('model/RequestAPI'),
        templateHtml = require("text!./MyOpptyTemplate.html"),
        TopLink = require("./TopLink");

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
        $("body").show();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        
        var viewModel,
            myOpptyViewModel = function () {
                var self = this;
                self.urlPrefix = sp.app.config.ENV.SDContentsUrl + "?OpptyID=";
                self.opptyList = ko.observable();
            };
        viewModel = new myOpptyViewModel(params);
        onViewModelLoaded(viewModel);
        return viewModel;
    }

    function getMyOppties(viewModel) {
        var vm = viewModel;
        sp.app.workingDialog.show("Retrieving My Opportunities..");
        requestAPI.getMyOpptyAsyc().done(function (oppties) {
            vm.opptyList(oppties);
            sp.app.workingDialog.hide("Retrieving My Opportunities..");
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

