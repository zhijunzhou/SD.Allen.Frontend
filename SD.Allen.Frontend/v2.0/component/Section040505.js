/*global define, alert, console, location*/
define('component/Section040505', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
		select2 = require('select2'),
        templateHtml = require("text!./Section040505Template.html"),
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
        //pop-up tooltip    
        $(".popover-options a").popover({ html: true });
        $('.popover-show').popover('hide');
    }

    function onViewModelLoaded() {
        vm.section.opptyID = sectionLoaderViewModel.opptyID();
        if (vm.editable()) {
            loadSection();
        } else {
            var data = sectionLoaderViewModel.document();
            if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcDeliveryResp != null) {
                if (data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                    doDataBinding(data);
                }
            }
        }
    }

    function loadSection(latestedSectionLoaderViewModel) {
        if (latestedSectionLoaderViewModel) {
            sectionLoaderViewModel = latestedSectionLoaderViewModel;
        }
        var data = sectionLoaderViewModel.document();
        if (data !== undefined && data.solnOverview != null && data.solnOverview.deliveryStrategies != null && data.solnOverview.deliveryStrategies.svcDeliveryResp != null) {
            doDataBinding(data);
        } else {
            vm.svcDeliveryResp([]);
            var temp = [];
            if (data !== undefined && data.solnOverview != null && data.solnOverview.scope != null && data.solnOverview.scope.allOfferings != null) {
                var allOffering = data.solnOverview.scope.allOfferings.data.content;
                for (var k in allOffering) {
                    temp.push({ offeringId: allOffering[k].offeringId, offering: allOffering[k].offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
                }
                vm.section.data.content(temp);
                for (var resp in temp) {
                    vm.svcDeliveryResp.push(new deliveryResp(temp[resp]));
                }
            }
            vm.pageInited(true);
        }
    }

    function deliveryResp(resp) {
        var me = this;
        me.offeringId = ko.observable(resp.offeringId);
        me.offering = ko.observable(resp.offering);
        me.delivery = ko.observable(resp.delivery);
        me.otherBuDelivery = ko.observable(resp.otherBuDelivery);
        me.specificBuDelivery = ko.observable(resp.specificBuDelivery);
        me.partnerDelivery = ko.observable(resp.partnerDelivery);
        me.thirdPartyDelivery = ko.observable(resp.thirdPartyDelivery);
        me.comment = ko.observable(resp.comment);

        me.index = vm.svcDeliveryResp().length;
        me.loaded = ko.observable(true);
        me.otherOptionVisible = ko.observable(false);
        update(me.otherBuDelivery());

        me.otherBuDelivery.subscribe(function (buDelivery) { me.updateSpecificBuDelivery(buDelivery); });
        me.updateSpecificBuDelivery = function (buDelivery) {
            me.loaded(false);
            update(buDelivery);
        }
        function update(buDelivery) {
            if (buDelivery == 'Other') {
                me.otherOptionVisible(true);
            } else {
                me.otherOptionVisible(false);
            }
        }
    }

    function createViewModel(params, componentInfo) {
        sectionLoaderViewModel = params.viewModel;
        onViewModelPreLoad();
        var svcDeliveryRespViewModel = function () {
            var self = this;
            self.section = {
                opptyID: "",
                eTag: "",
                name: "service-delivery-responsibilities",
                data: {
                    content: ko.observable([])
                }
            };
            self.editable = ko.observable(sectionLoaderViewModel.editable());
            self.pageInited = ko.observable(false);

            self.svcDeliveryResp = ko.observableArray([]);
        };
        vm = new svcDeliveryRespViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    function compareWithAllOffering(allOffering, svcDeliveryResp) {
        //compare allOfferings with  svcDeliveryResp in the offeringId field;
        var result = [];
        $.each(allOffering, function (offeringIndex, offering) {
            //find offering in svcDeliveryResp;
            var loc = -1;
            $.each(svcDeliveryResp, function (respIndex, resp) {
                if (resp.offeringId === offering.offeringId) {
                    /*
                     if the offering is found ,we push the existed resp into result ,
                     and end the query in svcDeliveryResp;
                     */
                    result.push(resp);
                    loc = respIndex;
                    return false;
                }
            });
            /*
            if the offering is not found ,we push a new resp into result ;
            */
            if (loc === -1) {
                result.push({ offeringId: offering.offeringId, offering: offering.offering, delivery: "", otherBuDelivery: "", specificBuDelivery: "", partnerDelivery: "", thirdPartyDelivery: "", comment: "", });
            }
        });

        return result;
    }

    function doDataBinding(data) {
        vm.svcDeliveryResp([]);
        var allOffering = data.solnOverview.scope.allOfferings.data.content;
        var svcDeliveryResp = unescapeContent(data.solnOverview.deliveryStrategies.svcDeliveryResp.data.content);
        var result = compareWithAllOffering(allOffering, svcDeliveryResp)

        vm.section.data.content(result);
        for (var resp in result) {
            vm.svcDeliveryResp.push(new deliveryResp(result[resp]));
        }

        vm.pageInited(true);
    }

    function saveOppty(event, argu) {
        var sid = argu.sid();
        if (sid !== '040505') {
            return;
        }
        if (!vm.pageInited()) {
            return;
        }
        var temp = doDataMapping();
        requestAPI.unifiedSave(true, temp, argu);
    }

    function doDataMapping() {
        var svcDeliveryResp = [];
        for (var resp in vm.svcDeliveryResp()) {
            svcDeliveryResp.push({ offeringId: vm.svcDeliveryResp()[resp].offeringId(), offering: vm.svcDeliveryResp()[resp].offering(), delivery: vm.svcDeliveryResp()[resp].delivery(), otherBuDelivery: vm.svcDeliveryResp()[resp].otherBuDelivery(), specificBuDelivery: vm.svcDeliveryResp()[resp].specificBuDelivery(), partnerDelivery: vm.svcDeliveryResp()[resp].partnerDelivery(), thirdPartyDelivery: vm.svcDeliveryResp()[resp].thirdPartyDelivery(), comment: vm.svcDeliveryResp()[resp].comment() });
        }
        vm.section.data.content(svcDeliveryResp);
        return escapeContent(ko.toJS(vm.section.data));
    }

    function escapeContent(data) {
        for (var i in data.content) {
            data.content[i].comment = escape(data.content[i].comment);
        }
        return data;
    }

    function unescapeContent(content) {
        for (var i in content) {
            content[i].comment = unescape(content[i].comment);
        }
        return content;
    }

    return {
        name: ["Section040505", "sd-section-040505"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});