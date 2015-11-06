/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        select2 = require('select2'),
        templateHtml = require("text!./Section050102.html");
      
    function onViewModelPreLoad() {}

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
          
        };
        return new viewModel(params);
    }

    return {
        name: ["Section050102", "sd-section-050102"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
    };
});