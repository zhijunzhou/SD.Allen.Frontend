/*global define, alert, console, location*/
define('component/Section040502', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040502Template.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
        return new viewModel(params);
    }

    return {
        name: ["Section040502", "sd-section-040502"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});