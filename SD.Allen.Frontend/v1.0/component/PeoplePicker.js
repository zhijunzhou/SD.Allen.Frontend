/*
 *  Single question for SD.
on the web page, please use like below:
<sd-peoplepicker params="{title: 'test question', content: testquestion}"></sd-peoplepicker>
avaiable params:
title: question title (mandatory)
content: a ko.observable() used to store html content
hint: a place holder to show default message (todo)
mandatory: indicate whether the field should be mandatory (todo)
 * 
 */

/*jslint browser: true, newcap: true, nomen: true, regexp: true*/
/*global $,SP,define,SPSODAction, _spPageContextInfo, ko,EnsureScript,SPUtility,console, SPClientPeoplePicker,SPClientPeoplePicker_InitStandaloneControlWrapper,ExecuteOrDelayUntilScriptLoaded,_v_dictSod*/
define('component/PeoplePicker', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        appUtility = require('util/AppUtility'),
        templateHtml = require("text!./PeoplePickerTemplate.html");

    ko.bindingHandlers.clientPeoplePicker = {
        currentId: 0,
        init: function (element, valueAccessor, allBindingsAccessor) {
            var obs = valueAccessor(),
                allBindings = allBindingsAccessor(),
                self = ko.bindingHandlers.clientPeoplePicker,
                currentElemId,
                subscribeObs = function (obs) {
                    if (typeof obs.__updateSubscribe === "undefined") {
                        obs.__updateSubscribe = obs.subscribe(function (newVal) {
                            self.updateUserValue(element, obs, allBindings);
                        }, 100);
                    }
                },
                disposeObs = function (obs) {
                    if (typeof obs.__updateSubscribe !== "undefined") {
                        obs.__updateSubscribe.dispose();
                        delete obs.__updateSubscribe;
                    }
                };
            self.currentId = self.currentId + 1;
            currentElemId = "ClientPeoplePicker" + self.currentId;
            if (!ko.isObservable(obs)) {
                throw "clientPeoplePicker binding requires an observable";
            }

            element.setAttribute("id", currentElemId);
            obs._peoplePickerId = currentElemId + "_TopSpan";
            self.initPeoplePicker(currentElemId, allBindings).done(function (picker) {
                obs._peoplePicker = picker;
                picker.OnUserResolvedClientScript = function (elementId, userInfo) {
                    var temp = [],
                        tempUser = {},
                        users = self.removeMultipleItem(element, userInfo);
                    $.each(users, function (i, user) {
                        if (user.Resolved) {
                            temp.push({
                                title: user.DisplayText,
                                name: user.Key,
                                email: user.EntityData.Email,
                                sipAddress: user.EntityData.SIPAddress == "" ? null : user.EntityData.SIPAddress,
                                type: user.EntityType
                            });
                        }
                    });
                    disposeObs(obs);
                    obs(temp);
                    subscribeObs(obs);
                };
                self.updateUserValue(element, obs, allBindings);
                subscribeObs(obs);
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (typeof obs.updateSubscribe !== "undefined") {
                    obs.updateSubscribe.dispose();
                    delete obs.updateSubscribe;
                }
            });
        },
        initPeoplePicker: function (elementId, allBindings) {
            var schema = {
                PrincipalAccountType: "User, DL, SecGroup, SPGroup",
                SearchPrincipalSource: 15,
                ResolvePrincipalSource: 15,
                MaximumEntitySuggestions: 10,
                width: '280px',
                AllowMultipleValues: (typeof (allBindings.multiple) !== "undefined" && allBindings.multiple === true)
            },
                dfd = $.Deferred();
            SPSODAction(["sp.js", "clienttemplates.js", "clientforms.js",
                "clientpeoplepicker.js", "autofill.js"], function () {
                    SPClientPeoplePicker_InitStandaloneControlWrapper(elementId, null, schema);
                    var picker = SPClientPeoplePicker.SPClientPeoplePickerDict[elementId + "_TopSpan"];
                    dfd.resolve(picker);
                });
            return dfd.promise();
        },

        removeMultipleItem: function (element, userInfo) {
            var existedItems = [],
                rlt = [];
            if (typeof userInfo !== "undefined" && userInfo.length > 0) {
                $.each(userInfo, function (i, a) {
                    if ($.inArray(a.Key, existedItems) !== -1) {
                        $(element).find(".sp-peoplepicker-resolveList [title='" + a.DisplayText + "']:eq(0)").parent().find(".sp-peoplepicker-delImage").click();
                    } else {
                        rlt.push(a);
                        existedItems.push(a.Key);
                    }
                });
            }
            return rlt;
        },
        getResolvedUserMails: function (peoplePicker) {
            var userInfos = peoplePicker.GetAllUserInfo(),
                rlt = [];
            $.each(userInfos, function (i, a) {
                if (a.IsResolved) {
                    rlt.push(a.EntityData.Email);
                }
            });
            return rlt;
        },
        getResolvedUserKeys: function (peoplePicker) {
            var userInfos = peoplePicker.GetAllUserInfo(),
                rlt = [];
            $.each(userInfos, function (i, a) {
                if (a.IsResolved) {
                    rlt.push(a.Key);
                }
            });
            return rlt;
        },
        updateUserValue: function (element, obs, allBindings) {
            var keys, updateKeys, allUpdateKeys, peoplePicker, newKeys,
                resolvedMails, resolvedKeys, removeTitles, $ele,
                elementId = $(element).attr("id"),
                self = ko.bindingHandlers.clientPeoplePicker;
            $ele = $("#" + elementId);
            peoplePicker = obs._peoplePicker;
            resolvedMails = self.getResolvedUserMails(peoplePicker);
            resolvedKeys = self.getResolvedUserKeys(peoplePicker);
            updateKeys = [];

            if (obs()) {
                if ($.isArray(obs())) {
                    $.each(obs(), function (i, a) {
                        updateKeys.push(a);
                    });
                } else {
                    updateKeys.push(obs());
                }
            }
            //new added user
            newKeys = [];
            allUpdateKeys = [];
            $.each(updateKeys, function (i, a) {
                var newKey;
                if (typeof a !== "undefined") {
                    if (typeof a === "string") {
                        newKey = a;
                    } else if (typeof a === "object") {
                        if (typeof a.email !== "undefined") {
                            newKey = a.email;
                        } else if (typeof a.name !== "undefined") {
                            newKey = a.name;
                        }
                    }
                }
                allUpdateKeys.push(newKey);
                if (typeof newKey !== "undefined") {
                    if ($.inArray(newKey, resolvedKeys) === -1 && $.inArray(newKey, resolvedMails) === -1) {
                        newKeys.push(newKey);
                    }
                }
            });

            //removed user
            removeTitles = [];
            //if user information changed on obs object directly, to keep consistence with obs object, people picker control also need to remove unexist user.
            $.each(peoplePicker.GetAllUserInfo(), function (i, a) {
                var inUse = false;
                if ($.inArray(a.Key, allUpdateKeys) === -1 && (typeof a.EntityData === "undefined" || $.inArray(a.EntityData.Email, allUpdateKeys) === -1)) {
                    removeTitles.push(a.DisplayText);
                }
            });
            $.each(removeTitles, function (i, a) {
                if (typeof a !== "undefined" && a.length > 0) {
                    $ele.find(".sp-peoplepicker-resolveList [title='" + a + "']:eq(0)").parent().find(".sp-peoplepicker-delImage").click();
                }
            });

            if (newKeys.length > 0) {
                peoplePicker.AddUserKeys(newKeys.join(";"));
            }

            if ((typeof (allBindings.enable) !== "undefined" && allBindings.enable === false) || (typeof (allBindings.disable) !== "undefined" && allBindings.enable === true)) {
                peoplePicker.SetEnabledState(false);
                $("#" + elementId + " .sp-peoplepicker-delImage").css("display", "none");
            }
        }
    };

    function SPSODAction(sodScripts, onLoadAction) {
        var x;
        if (SP.SOD.loadMultiple) {
            for (x = 0; x < sodScripts.length; x = x + 1) {
                if (!_v_dictSod[sodScripts[x]]) {
                    SP.SOD.registerSod(sodScripts[x], '/_layouts/15/' + sodScripts[x]);
                }
            }
            SP.SOD.loadMultiple(sodScripts, onLoadAction);
        } else {
            ExecuteOrDelayUntilScriptLoaded(onLoadAction, sodScripts[0]);
        }
    }

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var peopleViewModel,
            viewModel = function (params, componentInfo) {
                var vm = {
                    guid: 'sd-people-' + appUtility.newGuid(),
                    users: params.users,
                    peopleOnly: params.peopleOnly,
                    multiple: params.multiple,
                    title: ko.observable(),
                    hint: ko.observable(),
                    mandatory: ko.observable(false),
                    editable: ko.observable(true),
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
                    if (params.editable !== undefined) {
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
                }
                return vm;
            };
        peopleViewModel = viewModel(params, componentInfo);
        return peopleViewModel;
    }

    return {
        name: ["PeoplePicker", "sd-peoplepicker"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});