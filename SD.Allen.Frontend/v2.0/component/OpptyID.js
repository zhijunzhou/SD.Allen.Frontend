/*global define, alert, console, location*/
define('component/OpptyID', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        templateHtml = require("text!./OpptyIDTemplate.html");

    function onViewModelPreLoad() {}

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function (oppty) {
            var self = this;
            self.opptyID = ko.observable("");
            self.editable = ko.observable(false);
            if (oppty === undefined || oppty.opptyID === undefined) {
                //new oppty
                self.opptyID("OPP-");
                self.editable(true);
            } else {
                self.opptyID(oppty.opptyID);
                self.editable(false);
            }
            self.edit = function () {
                self.editable(true);
            };
            self.save = function () {
                self.editable(false);
            };
        };
        return new viewModel(params.oppty);
    }

    return {
        name: ["OpptyID", "sd-oppty-id"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});