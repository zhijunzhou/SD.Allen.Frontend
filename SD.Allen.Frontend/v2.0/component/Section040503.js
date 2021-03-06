﻿/*global define, alert, console, location*/
define('component/Section040503', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section040503Template.html"),
		requestAPI = require('model/RequestAPI'),
        vm = {},
		sectionLoaderViewModel = {};

    function listenCustomEvent() {
        $(window).off("opptySaving");
        $(window).on("opptySaving", saveOppty);
        $(window).off("updateSection");
        $(window).on("updateSection", function (e, newViewModel) {
            loadSection(newViewModel);
        });
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            //getsvcMgmt();
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcMgmt != null) {
                doDataBinding(data);
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcMgmt != null) {
            doDataBinding(data);
        } else {
            // section is not existed
        }
    }

    function doDataBinding(data) {
        var svcMgmt = unescapeContent(data.solnOverview.deliveryStrategies.svcMgmt.data);
        vm.section.data.svcMeasureDetail(svcMgmt.svcMeasureDetail);
        vm.section.data.supplierMgmtDetail(svcMgmt.supplierMgmtDetail);
        vm.section.data.perfMeasureDetail(svcMgmt.perfMeasureDetail);
        vm.section.data.catalogueStrategyDetail(svcMgmt.catalogueStrategyDetail);
        vm.section.data.toolingStrategyDetail(svcMgmt.toolingStrategyDetail);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040503') {
            return;
        }
        var temp = escapeContent(ko.toJS(vm.section.data));
        requestAPI.unifiedSave(true, temp, argu);
    }

    function escapeContent(content) {
        for (var p in content) {
            content[p] = escape(content[p]);
        }
        return content;
    }

    function unescapeContent(content) {
        for (var p in content) {
            content[p] = unescape(content[p]);
        }
        return content;
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var svcMgmtViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "service-management",
                data: {
                    svcMeasureDetail: ko.observable(""),
                    supplierMgmtDetail: ko.observable(""),
                    perfMeasureDetail: ko.observable(""),
                    catalogueStrategyDetail: ko.observable(""),
                    toolingStrategyDetail: ko.observable("")
                }
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
        };
        vm = new svcMgmtViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["Section040503", "sd-section-040503"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});