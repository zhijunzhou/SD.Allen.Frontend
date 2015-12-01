define('component/SDInputText', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./SDInputTextTemplate.html"),
        viewModel = {};
    
    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var inputTextViewModel = function (params, componentInfo) {
            var self = this;
            self.content = params.content;
            self.type = ko.observable('text'); //default type is text
            self.minVal = ko.observable(0);
            self.editable = ko.observable(true);
            self.hint = ko.observable();

            if (params != undefined && params != null) {                
                if (params.type != undefined) {
                    self.type(params.type);
                }
                if (params.minVal != undefined) {
                    self.minVal(params.minVal);
                }
                if (params.editable() != undefined) {
                    self.editable(params.editable());
                }
                if (params.hint !== undefined) {
                    self.hint(params.hint);
                }
            }
        };
        viewModel = new inputTextViewModel(params, componentInfo);

        return viewModel;
    }

    return {
        name: ["SDInputText", "sd-inputtext"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});