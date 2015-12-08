define('component/Section0702', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0702Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {


        return vm;
    }

    return {
        name: ["Section0702", "sd-section-0702"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});