define('component/Section0705', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0705Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {


        return vm;
    }

    return {
        name: ["Section0705", "sd-section-0705"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});