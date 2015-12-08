/*global define, alert, console, location*/
define('component/Section040504', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040504Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return new viewModel(params);
    }

    return {
        name: ["Section040504", "sd-section-040504"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});