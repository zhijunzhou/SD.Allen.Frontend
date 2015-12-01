define('component/TopLink', function (require) {
    "use strict";

    var ko = require("knockout"),
        bs = require("bootstrap"),
        templateHtml = require("text!./TopLinkTemplate.html");
    
    function createTopLinkViewModel(params, componentInfo) {
        var viewModel = {};

        
        return viewModel;
    }

    return {
        name: ["TopLink", "sd-toplink"],
        template: templateHtml,
        viewModel: { createViewModel: createTopLinkViewModel }
    };

});