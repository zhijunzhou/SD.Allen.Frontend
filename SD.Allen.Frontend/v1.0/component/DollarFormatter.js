define('component/DollarFormatter', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./DollarFormatterTemplate.html"),
        vm = {};

    function getFormattedDollar(dollarValue) {
        var dollarStr = dollarValue.toString();
        var formatted = "";
        var l = dollarStr.length;
        var count = 0;
        for (var i = l; i > 0; --i) {
            count = count + 1;
            formatted = dollarStr.charAt(i - 1) + formatted;
            if (count % 3 === 0 && count < l) {
                formatted = "," + formatted;
            }
        }
        formatted = "$" + formatted;
        console.log(formatted);
        vm.formattedDollar(formatted);
    }

    function createViewModel(params, componentInfo) {
        var dollarFormatterViewModel = function (params) {
            var self = this;
            self.dollarValue = params.dollarValue;
            self.formattedDollar = ko.observable("$0");

            //define functions;
            self.getFormattedDollar = function (dollarValue) {
                var dollarStr = dollarValue.toString();
                var formatted = "";
                var l = dollarStr.length;
                var count = 0;
                for (var i = l-1; i >= 0; --i) {
                    count = count + 1;
                    formatted = dollarStr.charAt(i) + formatted;
                    if (count % 3 === 0 && count < l) {
                        formatted = "," + formatted;
                    };
                }
                formatted = "$" + formatted;
                self.formattedDollar(formatted);
            }

            //define subscribes;
            self.dollarValue.subscribe(self.getFormattedDollar);
        };
        return new dollarFormatterViewModel(params);
    }

    return {
        name: ["DollarFormatter", "sd-component-dollarformatter"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});