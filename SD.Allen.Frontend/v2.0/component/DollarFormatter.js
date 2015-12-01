define('component/DollarFormatter', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./DollarFormatterTemplate.html"),
        vm = {};

    function createViewModel(params, componentInfo) {
        var dollarFormatterViewModel = function (params) {
            var self = this;
            self.dollarValue = params.dollarValue;
            //define functions;
            self.getFormattedDollar = function (dollarValue) {
                var dollarStr = dollarValue.toString();
                var formatted = "";
                var l = dollarStr.length;
                var count = 0;
                for (var i = l - 1; i >= 0; --i) {
                    count = count + 1;
                    formatted = dollarStr.charAt(i) + formatted;
                    if (count % 3 === 0 && count < l) {
                        formatted = "," + formatted;
                    };
                }
                formatted = "$" + formatted;
                return formatted;
            }

            self.formattedDollar = ko.observable(self.getFormattedDollar(self.dollarValue()));
        };
        vm = new dollarFormatterViewModel(params);
        return vm;
    }

    return {
        name: ["DollarFormatter", "sd-component-dollarformatter"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});