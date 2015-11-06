define('component/PopQuesArea', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        ko_tinyMCE = require('ko_tinyMCE'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./PopQuesAreaTemplate.html");

    function onViewModelPreLoad() {
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();        
        var questionViewModel,
             viewModel = function (params, componentInfo) {
                var self = this;
                self.guid = 'sd-question-' + appUtility.newGuid();
                self.config = {
                theme: "modern",
                menubar: false,
                statusbar: false,
                plugins: [
                    "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                    "searchreplace wordcount visualblocks visualchars code fullscreen",
                    "insertdatetime media nonbreaking save table contextmenu directionality filemanager"

                ],
                toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | link image filemanager",
                image_advtab: true
            };  
            self.content = ko.observable("");
            
            if (params !== undefined) {                
                if (params.content != undefined) {
                    self.content(params.content);
                }
            }
        };       
        questionViewModel = new viewModel(params, componentInfo);
        return questionViewModel;
    }

    return {
        name: ["PopQuesArea", "sd-popquesarea"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});