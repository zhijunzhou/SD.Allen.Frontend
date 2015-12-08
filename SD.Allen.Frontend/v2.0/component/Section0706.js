define('component/Section0706', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0706Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {


        return vm;
    }

    return {
        name: ["Section0706", "sd-section-0706"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});