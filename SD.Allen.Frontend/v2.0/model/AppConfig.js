define('model/sp.app.config', function (require) {
    "use strict";
    var listCollection = {
        Core: "Core",
        SDCore: "SD%20Core",
        SSDocLib: "SSDocLib"
    },
    releaseVersion = 1,
    datetimepickerOption = {
        format: "MMM D YYYY",
        sideBySide: true
    },
    webAPI = {
        Grip: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
        GDT: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
        HRSoln: 'https://c4w03910.americas.hpqcorp.net/api/salesforce'
    },
    ApiStaging = function() {
        if (window.sd.env == 'qa') {
            return {
                Staging1: 'https://c4w19235.americas.hpqcorp.net'
            }
        } else if (window.sd.env == 'Staging') {
            return {
                Staging1: 'https://c4w17196.americas.hpqcorp.net',
                Staging2: 'https://c4w17197.americas.hpqcorp.net',
                Staging3: 'https://c4w17198.americas.hpqcorp.net',
                Staging4: 'https://c4w17199.americas.hpqcorp.net'
            };
        } else {
            //production env
            return {
                Staging1: 'https://c4w17099.americas.hpqcorp.net',
                Staging2: 'https://c4w17100.americas.hpqcorp.net',
                Staging3: 'https://c4w17101.americas.hpqcorp.net',
                Staging4: 'https://c4w17102.americas.hpqcorp.net'
            };
        }
    },
    ENV = {
        siteRelativeUrl: _spPageContextInfo.siteServerRelativeUrl,
        siteAbsoluteUrl: _spPageContextInfo.siteAbsoluteUrl,
        userId: _spPageContextInfo.userId,
        SectionLoaderUrl: _spPageContextInfo.siteServerRelativeUrl + "/SitePages/SDSectionLoader.aspx",
        SDContentsUrl: _spPageContextInfo.siteServerRelativeUrl + "/SitePages/SDContents.aspx",
        SDDocLibUrl: _spPageContextInfo.siteServerRelativeUrl + "/SSDocLib/"
    };

    return {
        ListCollection: listCollection,
        ReleaseVersion:releaseVersion,
        datetimepickerOption:datetimepickerOption,
        WebAPI: webAPI,
        ApiStaging: ApiStaging(),
        ENV: ENV
    };

});