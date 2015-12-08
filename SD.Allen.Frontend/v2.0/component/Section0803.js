/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0803.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return new viewModel(params);
    }

    return {
        name: ["Section0803", "sd-section-0803"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});