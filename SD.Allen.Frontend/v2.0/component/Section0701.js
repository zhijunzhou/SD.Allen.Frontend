define('component/Section0701', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0701Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        

        return vm;
    }

    return {
        name: ["Section0701", "sd-section-0701"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});