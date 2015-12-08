/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0411.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
            self.inRow = ko.observableArray([
               { txt: "" },
               { txt: "" },
               { txt: "" },
               { txt: "" },
               
            ]);
            self.rowNumber = ko.observable(10);
            self.tableText = ko.observable("");

            self.addRow = function () {
                if (self.inRow.length % 2 == 0) {
                    self.inRow.push({ txt: "bg-info" });// the style depending on the length of the InRow
                }
                else {
                    self.inRow.push({ txt: "" });
                }
            };
            self.remove = function () {
                self.inRow.remove(this);
            }
        };
        return new viewModel(params);
    }

    return {
        name: ["Section0401", "sd-section-0411"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});