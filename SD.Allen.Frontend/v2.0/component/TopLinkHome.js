define('component/TopLinkHome', function (require) {
    "use strict";

    var ko = require("knockout"),
        bs = require("bootstrap"),
        templateHtml = require("text!./TopLinkHomeTemplate.html");
    
    function createTopLinkViewModel(params, componentInfo) {
        var viewModel =  { };        
        viewModel.navToNewRequestForm = function () {
            location.href = "NewRequestForm.aspx";
        };        
       
        return viewModel;
    }

    return {
        name: ["TopLinkHome", "sd-toplink-home"],
        template: templateHtml,
        viewModel: { createViewModel: createTopLinkViewModel }
    };

});