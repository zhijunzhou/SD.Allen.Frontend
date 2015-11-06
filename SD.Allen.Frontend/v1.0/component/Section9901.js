/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        dataTables = require('dataTables'),
        //tableTools = require('tableTools'),
        templateHtml = require("text!./Section9901.html"),
        TopLink = require("./TopLinkHome"),
        appConfig = require('model/AppConfig'),
        opptyModel = require('model/oppty');


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

    function onViewModelLoad(viewModel) {
        opptyModel.getAllAsync().done(function (data) {
            viewModel.opptyCollection(data);
        })
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = {
            
            opptyCollection : ko.observableArray()

        };
        onViewModelLoad(viewModel)
        return viewModel;
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

