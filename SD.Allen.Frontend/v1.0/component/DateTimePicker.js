/// <reference path="SDErrorPageTemplate.html" />
define('component/DateTimePicker', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        datetimepicker = require('datetimepicker'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./DateTimePickerTemplate.html");

    ko.bindingHandlers.dateTimePicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var obs = valueAccessor(),
                self = ko.bindingHandlers.dateTimePicker,
                options = allBindingsAccessor().dateTimePickerOptions || {},
                subscribeObs = function (obs) {
                    if (typeof obs.__updateSubscribe === "undefined") {
                        obs.__updateSubscribe = obs.subscribe(function (newVal) {
                            self.update(element, valueAccessor, allBindingsAccessor);
                        }, 100);
                    }
                };
            $(element).datetimepicker(options);

            //when a user changes the date, update the view model
            ko.utils.registerEventHandler(element, "dp.change", function (event) {
                var value = valueAccessor();
                if (ko.isObservable(value)) {
                    if (event.date != null && !(event.date instanceof Date)) {
                        //value(event.date.toDate());
                        if (event.date)
                            value(event.date.toISOString());
                        else
                            value('');
                    } else {
                        value(event.date);
                    }
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var picker = $(element).data("DateTimePicker");
                if (picker) {
                    picker.destroy();
                }
            });
            subscribeObs(obs);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                self = self = ko.bindingHandlers.dateTimePicker,
                picker = $(element).data("DateTimePicker");
            //when the view model is updated, update the widget
            if (picker) {
                var koDate = new Date(ko.utils.unwrapObservable(valueAccessor()));
                if (self.isValidDate(koDate)) {
                    picker.date(koDate);
                } else {
                    picker.date(null);
                }
            }
        },
        isValidDate: function (d) {
        if (Object.prototype.toString.call(d) === "[object Date]") {
            // it is a date
            if (isNaN(d.getTime())) {  // d.valueOf() could also work
                // date is not valid
                return false;
            }
            else {
                // date is valid
                return true;
            }
        }
        else {
            // not a date
            return false;
        };
    }
    };

    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    Date.prototype.toISOString = function () {
        return this.getUTCFullYear() +
          '-' + pad(this.getUTCMonth() + 1) +
          '-' + pad(this.getUTCDate()) +
          'T' + pad(this.getUTCHours()) +
          ':' + pad(this.getUTCMinutes()) +
          ':' + pad(this.getUTCSeconds()) +
          //'.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z';
    };

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var dateTimePickerViewModel,
            viewModel = function (params, componentInfo) {
                var vm = {
                    guid: 'sd-dtPicker-' + appUtility.newGuid(),
                    dateTime: params.dateTime,
                    dateTimePickerOptions: {},
                    title: ko.observable(),
                    hint: ko.observable(),
                    mandatory: ko.observable(false),
                    editable: ko.observable(true),
                    formattext: function () {
                        return new Date(params.dateTime()).format("MMM dd yyyy");
                    },
                    edit: function () {
                        if (!vm.editable()) {
                            vm.editable(true);
                        }
                    },
                    editCompleted: function () {
                        if (vm.editable()) {
                            vm.editable(false);
                        }
                    }
                };
                if (params !== undefined) {
                    if (params.editable != undefined) {
                        vm.editable(params.editable());
                    }
                    if (params.title !== undefined) {
                        vm.title(params.title);
                    }
                    if (params.hint !== undefined) {
                        vm.hint(params.hint);
                    }
                    if (params.mandatory !== undefined) {
                        vm.mandatory(params.mandatory);
                    }
                    if (params.dateTimePickerOptions !== undefined) {
                        vm.dateTimePickerOptions = params.dateTimePickerOptions;
                    } else {
                        vm.dateTimePickerOptions= {
                            format: "YYYY-MM-DD",
                            sideBySide: true
                        };
                    }
                }
                return vm;
            };
        dateTimePickerViewModel = new viewModel(params, componentInfo);
        return dateTimePickerViewModel;
    }

    return {
        name: ["DateTimePicker", "sd-datetimepicker"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});