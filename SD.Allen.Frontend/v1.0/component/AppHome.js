/*global define*/
define('component/AppHome', function (require) {
    "use strict";

    var $ = require("jquery"),
        ko = require("knockout"),
        appUtility = require('util/AppUtility'),
        opptyModel = require('model/Oppty'),
        appConfig = require('model/AppConfig'),
        requestAPI = require('model/RequestAPI'),
        ko_auto = require('ko_autocomplete'),
        templateHtml = require("text!./AppHomeTemplate.html"),
        TopLink = require("./TopLinkHome");
      
    function Oppty(data) {
        this.opptyId = "";
        this.clientName = "";
        this.opptyName = "";
        this.displayName = "";


        if (data !== undefined) {
            this.opptyId = data.opptyId;
            this.opptyName = data.opptyName;
            this.clientName = data.clientName;
            this.displayName = data.opptyId + " " + data.clientName + " " + data.opptyName;
        }
    }

    function onViewModelPreLoad() {
        //$('#s4-ribbonrow').hide();
        //$('#s4-titlerow').hide();
    }
    
    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var sdContentieViewModel = function () {
            var self = this;
            self.myValue = ko.observable();
            self.opptyCollection = ko.observableArray();
            requestAPI.getAllOpptyAsync().done(function (oppties) {
                //self.opptyCollection(oppties);
                for (var i in oppties) {
                    self.opptyCollection.push(new Oppty(oppties[i]));
                }
            }, self);

            //define function
            self.redirect2SdContent = function () {
                if (self.myValue().opptyId != undefined)
                    window.location.href = appConfig.ENV.SDContentsUrl + "?OpptyID=" + self.myValue().opptyId;
                else
                    alert("Opportunity not found!");
            }            
        };
        var viewModel = new sdContentieViewModel();
        return viewModel;
    }

    return {
        name: "AppHome",
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        },
        subComponents: [TopLink]
    };

});