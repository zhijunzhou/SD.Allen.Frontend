define('component/Section0707', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0707Template.html"),
        vm = {};

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {

        var goverStuctMgtViewModel = function () {
            var self = this;
            self.editable = ko.observable(true);
        }

        return vm;
    }

    return {
        name: ["Section0707", "sd-section-0707"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});