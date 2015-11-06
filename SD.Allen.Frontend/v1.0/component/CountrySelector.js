define('component/CountrySelector', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        select2 = require('select2'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./CountrySelectorTemplate.html"),
        vm = {};

    ko.bindingHandlers.option = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            ko.selectExtensions.writeValue(element, value);
        }
    };

    var countries2 = [
                new Map("AR", "Argentina"),
                new Map("BR", "Brazil"),
                new Map("CA", "Canada"),
                new Map("CL", "Chile"),
                new Map("CO", "Colombia"),
                new Map("CR", "Costa Rica"),
                new Map("MX", "Mexico"),
                new Map("OtherAMS", "Other AMS"),
                new Map("PA", "Panama"),
                new Map("PE", "Peru"),
                new Map("US", "United States"),
                new Map("AU", "Australia"),
                new Map("CN", "China"),
                new Map("HK", "Hong Kong"),
                new Map("IN", "India"),
                new Map("ID", "Indonesia"),
                new Map("JP", "Japan"),
                new Map("KR", "Korea"),
                new Map("MY", "Malaysia"),
                new Map("NZ", "New Zealand"),
                new Map("OtherAPJ", "Other APJ"),
                new Map("PH", "Philippines"),
                new Map("SG", "Singapore"),
                new Map("TW", "Taiwan"),
                new Map("TH", "Thailand"),
                new Map("VN", "Vietnam"),
                new Map("AT", "Austria"),
                new Map("BE", "Belgium"),
                new Map("BG", "Bulgaria"),
                new Map("CZ", "Czech Republic"),
                new Map("DK", "Denmark"),
                new Map("EG", "Egypt"),
                new Map("FI", "Finland"),
                new Map("FR", "France"),
                new Map("DE", "Germany"),
                new Map("GR", "Greece"),
                new Map("HU", "Hungary"),
                new Map("IE", "Ireland"),
                new Map("IL", "Israel"),
                new Map("IT", "Italy"),
                new Map("LU", "Luxembourg"),
                new Map("NL", "Netherlands"),
                new Map("NO", "Norway"),
                new Map("OtherEMEA", "Other EMEA"),
                new Map("PL", "Poland"),
                new Map("PT", "Portugal"),
                new Map("RO", "Romania"),
                new Map("RU", "Russia"),
                new Map("SA", "Saudi Arabia"),
                new Map("ZA", "South Africa"),
                new Map("ES", "Spain"),
                new Map("SE", "Sweden"),
                new Map("CH", "Switzerland"),
                new Map("TR", "Turkey"),
                new Map("AE", "UAE"),
                new Map("GB", "United Kingdom")

    ];

    var countries = [
            new Tree("AMS", [
                new Map("AR", "Argentina"),
                new Map("BR", "Brazil"),
                new Map("CA", "Canada"),
                new Map("CL", "Chile"),
                new Map("CO", "Colombia"),
                new Map("CR", "Costa Rica"),
                new Map("MX", "Mexico"),
                new Map("OtherAMS", "Other AMS"),
                new Map("PA", "Panama"),
                new Map("PE", "Peru"),
                new Map("US", "United States")
            ]),
            new Tree("APJ", [
                new Map("AU", "Australia"),
                new Map("CN", "China"),
                new Map("HK", "Hong Kong"),
                new Map("IN", "India"),
                new Map("ID", "Indonesia"),
                new Map("JP", "Japan"),
                new Map("KR", "Korea"),
                new Map("MY", "Malaysia"),
                new Map("NZ", "New Zealand"),
                new Map("OtherAPJ", "Other APJ"),
                new Map("PH", "Philippines"),
                new Map("SG", "Singapore"),
                new Map("TW", "Taiwan"),
                new Map("TH", "Thailand"),
                new Map("VN", "Vietnam")
            ]),
            new Tree("EMEA", [
                new Map("AT", "Austria"),
                new Map("BE", "Belgium"),
                new Map("BG", "Bulgaria"),
                new Map("CZ", "Czech Republic"),
                new Map("DK", "Denmark"),
                new Map("EG", "Egypt"),
                new Map("FI", "Finland"),
                new Map("FR", "France"),
                new Map("DE", "Germany"),
                new Map("GR", "Greece"),
                new Map("HU", "Hungary"),
                new Map("IE", "Ireland"),
                new Map("IL", "Israel"),
                new Map("IT", "Italy"),
                new Map("LU", "Luxembourg"),
                new Map("NL", "Netherlands"),
                new Map("NO", "Norway"),
                new Map("OtherEMEA", "Other EMEA"),
                new Map("PL", "Poland"),
                new Map("PT", "Portugal"),
                new Map("RO", "Romania"),
                new Map("RU", "Russia"),
                new Map("SA", "Saudi Arabia"),
                new Map("ZA", "South Africa"),
                new Map("ES", "Spain"),
                new Map("SE", "Sweden"),
                new Map("CH", "Switzerland"),
                new Map("TR", "Turkey"),
                new Map("AE", "UAE"),
                new Map("GB", "United Kingdom")
            ])
    ];
    
    function Map(key, value) {
        //this.key = ko.observable(key);
        //this.value = ko.observable(value);
        return {
            key: key,
            value:value
        }
    }

    function Tree(label, mapList) {
        //this.label = ko.observable(label);
        //this.mapList = ko.observableArray(mapList);
        return {
            label: label,
            mapList:mapList
        }
    }

    function extractCntry(codeArray) {
        var extractCnties = [];
        for (var i in codeArray) {
            extractCnties.push(codeArray[i].text);
        }
        return extractCnties;
    }

    function onViewModelPreLoad() {
        //$('#countries').select2({ tags: true });
    }

    function onViewModelLoaded(viewModel) {
        //$('#countries').val(vm.data()).trigger("change");
        //vm.selectedcountries(extractCntry($('#countries').select2('data')));
        //$('#countries').select2('container').hide();        
        var extractCnties = [];
        for (var i in vm.data()) {
            for (var j in countries2) {
                if (vm.data()[i] === countries2[j].key) {
                    extractCnties.push(countries2[j].value);
                }
            }
        }
        vm.selectedcountries(extractCnties);
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var  componentViewModel = function (params, componentInfo) {
                var self = this;
                self.guid = 'sd-cntry-' + appUtility.newGuid();
                self.title = ko.observable();
                self.data = params.data;
                self.editable = ko.observable(true);

                self.selectedcountries = ko.observable();

                if (params !== undefined) {
                    if (params.editable != undefined) {
                        vm.editable = params.editable();
                    }
                    if (params.title !== undefined) {
                        vm.title = params.title;
                    }
                }
            };
        vm = new componentViewModel(params, componentInfo);
        onViewModelLoaded(vm);
        return vm;
    }

    return {
        name: ["CountrySelector", "sd-countryselector"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});