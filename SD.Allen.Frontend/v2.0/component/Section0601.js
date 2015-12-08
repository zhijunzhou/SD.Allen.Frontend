/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0601.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;

            self.InRow = ko.observableArray([
                { txt: "bg-info" },
                { txt: "" },
                 { txt: "bg-info" },
                { txt: "" },
                 { txt: "bg-info" },
                { txt: "" }
            ]);

            self.rowNumber = ko.observable(6);
            self.tableText = ko.observable("");            
            
            self.addRow = function () {                
                if (self.InRow.length % 2 == 0) {
                    self.InRow.push({ txt: "bg-info" });// the style depending on the length of the InRow
                }
                else {
                    self.InRow.push({ txt: "" });
                }                
            };
            self.remove = function () {               
                self.InRow.remove(this);
            }            
        };
        return new viewModel(params);
    }

    return {
        name: ["Section0601", "sd-section-0601"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});