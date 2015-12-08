define('component/Section0704', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0704Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {


        return vm;
    }

    return {
        name: ["Section0704", "sd-section-0704"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});