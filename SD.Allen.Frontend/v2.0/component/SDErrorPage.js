define('component/SDErrorPage', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./SDErrorPageTemplate.html");


    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return viewModel;
    }

    return {
        name: ["SDErrorPage", "sd-errorpage"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});