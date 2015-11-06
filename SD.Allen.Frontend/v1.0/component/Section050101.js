/*global define, alert, console, location*/
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        select2 = require('select2'),
        multiselect = require('multiselect'),
        templateHtml = require("text!./Section050101.html");
  
    function onViewModelPreLoad() {
        $(document).ready(function () {
            $('#example-select2').select2({
                tags: true,
                tokenSeparators: [',', ' '],
                theme: "classic",
                width: 400,
                multiple: true,
                allowClear: true
            });
            $('#example-multiselect').multiselect();
        });
    }

    function createViewModel() {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
        };
       
        return new viewModel();
    }

    return {
        name: ["Section050101", "sd-section-050101"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    }
});


