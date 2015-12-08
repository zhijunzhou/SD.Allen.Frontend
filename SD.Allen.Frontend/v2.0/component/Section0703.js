define('component/Section0703', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0703Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {


        return vm;
    }

    return {
        name: ["Section0703", "sd-section-0703"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});