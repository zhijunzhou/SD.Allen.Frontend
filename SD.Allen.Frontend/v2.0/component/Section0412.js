/*global define, alert, console, location*/
var availableOpts = [
             { opt: 'Yes', id: 1 },
             { opt: 'No', id: 0 }
];
define(function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./Section0412.html");

    function onViewModelPreLoad() { }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var viewModel = function () {
            var self = this;
            self.inRow = ko.observableArray([
              { txt: "" },
              { txt: "" },
              { txt: "" },
              { txt: "" },

            ]);

            self.rowNumber = ko.observable(10);
            self.tableText = ko.observable("");

            self.addRow = function () {
                if (self.inRow.length % 2 == 0) {
                    self.inRow.push({ txt: "bg-info" });// the style depending on the length of the InRow
                }
                else {
                    self.inRow.push({ txt: "" });
                }
            };
            self.remove = function () {
                self.inRow.remove(this);
            }

            /* Load json data from server */
            self.winStrategyData = ko.observable();
            self.clientKeyDriverDetail = ko.observable();
            self.dealBenefitDetail = ko.observable();
            self.criticalSuccessFactorDetail = ko.observable();
            self.dealEssentialDetail = ko.observable();
            self.hpKeyDiffDetail = ko.observable();
            self.keyCompetitor = ko.observable();
            self.clientReqSummary = ko.observable();
            self.clientReference = ko.observable();
            self.clientPriceExpectDetail = ko.observable();
            self.competitorsPricingApproachDetial = ko.observable();
            self.majorFinancialIssue = ko.observable();

            getPageElement(self);
            /* Load json data from server */

            /*SECSTYART codeSection 1:requirementsTable binding */
            self.requirementsTable = ko.observableArray([
                //set a observableArray and initialize it;
               //requirementsTable tbody will be binded with the following Array ;
                { txt: "bg-info" },
               { txt: "" },
               { txt: "bg-info" },
               { txt: "" },
                { txt: "bg-info" },
               { txt: "" }
            ]);
            self.addRow = function () {
                if (self.requirementsTable.length % 2 == 0) {
                    self.requirementsTable.push({ txt: "bg-info" });// the style depending on the length of the requirementsTable
                }
                else {
                    self.requirementsTable.push({ txt: "" });
                }
            };
            self.remove = function () {
                self.requirementsTable.remove(this);
            }
            /*SECEND */

            /*SECSTYART codeSection 2: make chosenOpt observable and initialize it's value with availableOpts[0] */
            self.chosenOpt = ko.observable(availableOpts[0]);
            /*SECEND */

            /*SECSTART codeSection 3 :requirementsTable binding */
            self.rowNumber = ko.observable(4);
            self.competitorNumberTxt = ko.observable("top 4 ");
            self.competitorsTableCode = ko.dependentObservable(function () {
                var text = "";
                if (self.rowNumber() < 4) {
                    self.competitorNumberTxt("all ");
                } else {
                    self.competitorNumberTxt("top " + self.rowNumber() + " ");
                }
                for (i = 0; i < self.rowNumber() ; i++) {
                    //the style of the lines  will present integratedly
                    if (i % 2 == 0)
                        text = text + "<tr class='bg-info'><td>&nbsp;</td><td></td>><td></td>><td></td><td></td></tr>";
                    else
                        text = text + "<tr><td>&nbsp;</td><td></td>><td></td>><td></td><td></td></tr>";
                }
                return text;
            }, self);
            /*SECEND */

        };

        return new viewModel(params);
    }
    function getPageElement(viewModel) {
        var self = viewModel;
        var jsonUrl = "/teams/ESSolutionDesign-Staging/SiteAssets/modules/v0.2/sample/0302_01.txt";
        //var jsonUrl3 = appInit.URL_HOME + "/sample/SD_Fronted_JSON_Zac0729.json";
        $.ajax({
            type: 'get',
            url: jsonUrl,
            //data: "",
            dataType: 'json',
            async: false,//false代表只有在等待ajax执行完毕后才执行该句代码的下一句代码；
        }).done(function (data) {
            //数据获取完成后执行data的本地化;
            self.winStrategyData(data.WinStrategy);
            self.clientKeyDriverDetail(self.winStrategyData().ClientKeyDriverDetail);
            self.dealBenefitDetail(self.winStrategyData().DealBenefitDetail);
            self.criticalSuccessFactorDetail(self.winStrategyData().CriticalSuccessFactorDetail);
            self.dealEssentialDetail(self.winStrategyData().DealEssentialDetail);
            self.hpKeyDiffDetail(self.winStrategyData().HPKeyDiffDetail);
            self.keyCompetitor(self.winStrategyData().KeyCompetitor);
            self.clientReqSummary(self.winStrategyData().ClientReqSummary);
            self.clientReference(self.winStrategyData().ClientReference);
            self.clientPriceExpectDetail(self.winStrategyData().ClientPriceExpectDetail);
            self.competitorsPricingApproachDetial(self.winStrategyData().CompetitorsPricingApproachDetial);
            self.majorFinancialIssue(self.winStrategyData().MajorFinancialIssue);
        });
    }
    return {
        name: ["Section0412", "sd-section-0412"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});