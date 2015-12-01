/* * * * * * * * * * * 
 * FRAMEWORK ASSETS  *
 * * * * * * * * * * */

window.sp = {
    app: {
        environments: {
            base: {
                framework: {
                    name: "sd",
                    version: "2.0",
                    sp: {
                        site: /regex-rule-to-test-url/i
                    },
                    requireJS: {
                        paths: {
                            //  follow app directory structure convention
                            module: 'module',
                            model: 'model',
                            util: 'util',
                            js: 'js',
                            //  SharePoint Runtime and Core
                            //  Register any SharePoint Library if it is required to be processed first
                            'spruntime_js': "/_layouts/15/sp.runtime",
                            'sp_js': "/_layouts/15/sp",

                            //'jquery-private': 'js/jquery-private',
                            'bootstrap': 'js/bootstrap.min',
                            "knockout": 'js/knockout-3.3.0',
                            'ko': 'js/knockout-3.3.0',

                            //  Other Plugins, 
                            'jasnybs': 'js/jasny-bootstrap.min',
                            'select2': 'js/select2.min', //select2 multipleselect control, https://select2.github.io/
                            'datetimepicker': 'js/bootstrap-datetimepicker.min', //datetimepicker control,  https://github.com/Eonasdan/bootstrap-datetimepicker
                            'moment': 'js/moment.min',
                            "komapping": "js/knockout.mapping-latest",
                            "tinyMCE": "vendor/tinymce/tinymce.min",//tinyMCE
                            "jQuery_tinyMCE": "vendor/tinymce/jquery.tinymce.min",//tinyMCE
                            'ko_tinyMCE': 'js/wysiwyg',
                            "jquery-ui": "js/jquery-ui",
                            "ko_autocomplete": "js/knockout-jqAutocomplete",//https://github.com/rniemeyer/knockout-jqAutocomplete
                            "dataTables": "js/jquery.dataTables",
                            "numBox": "js/jquery.numbox-1.2.0.min",
                            "jquery_bootstrap": "js/jquery.bootstrap.min",
                            //'tableTools': 'js/dataTables.tableTools.min',
                            "ko_bootstrap": "js/knockout-bootstrap.min",//http://billpull.com/knockout-bootstrap/index.html

                        },
                        map: {
                            "*": {
                                "jquery": "global!$"
                            }
                            // '*' means all modules will get 'jquery-private'
                            // for their 'jquery' dependency.
                            //'*': {
                            //    'jquery': 'jquery-private'
                            //},

                            // 'jquery-private' wants the real jQuery module
                            // though. If this line was not here, there would
                            // be an unresolvable cyclic dependency.
                            //'jquery-private': {
                            //    'jquery': 'jquery'
                            //}
                        },
                        shim: {
                            'komapping': {
                                deps: ["knockout"],
                                exports: "komapping"
                            },
                            'jasnybs': {
                                deps: ['bootstrap']
                            },
                            'multiselect': {
                                deps: ['bootstrap', "knockout", 'global!$'],
                                exports: 'multiselect'
                            },
                            'select2': {
                                deps: ['global!$', 'bootstrap'],
                                exports: 'select2'
                            },
                            'datetimepicker': {
                                deps: ['bootstrap', 'moment']
                            },
                            'tinyMCE': {
                                exports: 'tinyMCE',
                                init: function () {
                                    this.tinyMCE.DOM.events.domLoaded = true;
                                    return this.tinyMCE;
                                }
                            },
                            'ko_tinyMCE': {
                                deps: ["knockout", 'global!$', 'tinyMCE'],
                            },
                            'ko_bootstrap': {
                                deps: ['bootstrap', 'knockout'],
                                exports: 'ko_bootstrap'
                            },
                            "jquery-ui": {
                                exports: "$",
                                deps: ['global!$']
                            },
                            'ko_autocomplete': {
                                deps: ['jquery-ui', 'knockout'],
                                exports: 'ko_autocomplete'
                            },
                            'dataTables': {
                                deps: ['global!$'],
                                exports: 'dataTables'
                            },
                            'numBox': {
                                deps: ['global!$'],
                                exports: 'numBox'
                            },
                            'jquery_bootstrap': {
                                deps: ['global!$', 'bootstrap'],
                                exports: 'jquery_bootstrap'
                            }
                            //'tableTools': {
                            //    deps: ['dataTables'],
                            //    exports:'tableTools'
                            //}

                        },
                        bundles: {
                            'js/sd-components': [
                                'util/apputility',
                                'model/Oppty',
                                'model/RequestAPI',
                                'component/TopLink',
                                'component/TopLinkHome',
                                'component/OpptyID',
                                'component/DateTimePicker',
                                'component/PeoplePicker',
                                'component/PopQuesArea',
                                'component/QuestionArea',
                                'component/AllOppty',
                                'component/AppHome',
                                'component/MyOppty',
                                'component/CountrySelector',
                                'component/ReviewAndExtract',
                                'component/AttachmentManager',
                                'component/DollarFormatter',
                                'component/Section0201',
                                'component/Section0202',
                                'component/Section0301',
                                'component/Section030201',
                                'component/Section030202',
                                'component/Section030203',
                                'component/Section030204',
                                'component/Section040101',
                                'component/Section040102',
                                'component/Section0402',
                                'component/Section040301',
                                'component/Section040302',
                                'component/Section040303',
                                'component/Section040304',
                                'component/Section040305',
                                'component/Section040306',
                                'component/Section040307',
                                'component/Section0404',
                                'component/Section040501',
                                'component/Section040502',
                                'component/Section040503',
                                'component/Section040504',
                                'component/Section040505',
                                'component/Section040506',
                                'component/Section0406',
                                'component/Section0407',
                                'component/SDContents',
                                'component/SectionLoader'
                            ]
                        }
                    },
                    ko: {
                        path: "knockout"
                    },
                    pageHandlers: {
                        "default_styles": {
                            url: /SitePages\/(home|sd|ss).*\.aspx/i,
                            areas: ["body"],
                            module: "css!css/sd.min.css"
                        }
                    }
                },
                others: {
                    ListCollection: {
                        Core: "Core",
                        SDCore: "SD%20Core",
                        SSDocLib: "SSDocLib"
                    },
                    ReleaseVersion: 1,
                    datetimepickerOption: {
                        format: "MMM D YYYY",
                        sideBySide: true
                    },
                    WebAPI: {
                        Grip: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
                        GDT: 'https://c4w04012.americas.hpqcorp.net/api/salesforce',
                        HRSoln: 'https://c4w03910.americas.hpqcorp.net/api/salesforce'
                    },
                    ApiStaging: {},
                    ENV:{}
                }
            },
            development: {
                framework: {
                    sp: {
                        site: /\/ESSolutionSource-QA($|\/)/i
                    },
                    requireJS: {
                        bundles: undefined
                    },
                    pageHandlers: {
                        "sd_shared_styles": {
                            url: /SitePages\/(home|sd|ss).*\.aspx/i,
                            module: "css!css/sd-shared.css"
                        }
                    }
                },
                others: {
                    ApiStaging: {
                        Staging1: 'https://c4w19235.americas.hpqcorp.net'
                    },
                    ENV: {
                        siteRelativeUrl: "/teams/ESSolutionSource-QA",
                        siteAbsoluteUrl: "https://ent302.sharepoint.hp.com/teams/ESSolutionSource-QA",
                        SectionLoaderUrl:"/teams/ESSolutionSource-QA/SitePages/SDSectionLoader.aspx",
                        SDContentsUrl: "/teams/ESSolutionSource-QA/SitePages/SDContents.aspx",
                        SDDocLibUrl: "/teams/ESSolutionSource-QA/SSDocLib/"
                    }
                }
            },
            staging: {
                framework: {
                    sp: {
                        site: /\/ESSD($|\/)/i
                    }
                },
                others: {
                    ApiStaging: {
                        Staging1: 'https://c4w17196.americas.hpqcorp.net',
                        Staging2: 'https://c4w17197.americas.hpqcorp.net',
                        Staging3: 'https://c4w17198.americas.hpqcorp.net',
                        Staging4: 'https://c4w17199.americas.hpqcorp.net'
                    },
                    ENV: {
                        siteRelativeUrl: "/teams/ESSD",
                        siteAbsoluteUrl: "https://vg9w4029-ent302.houston.hp.com/teams/ESSD",
                        SectionLoaderUrl: "/teams/ESSD/SitePages/SDSectionLoader.aspx",
                        SDContentsUrl: "/teams/ESSD/SitePages/SDContents.aspx",
                        SDDocLibUrl: "/teams/ESSD/SSDocLib/"
                    }
                }
            },
            production: {
                framework: {
                    sp: {
                        site: /\/ESSolutionSource($|\/)/i
                    }
                },
                others: {
                    ApiStaging: {
                        Staging1: 'https://c4w17099.americas.hpqcorp.net',
                        Staging2: 'https://c4w17100.americas.hpqcorp.net',
                        Staging3: 'https://c4w17101.americas.hpqcorp.net',
                        Staging4: 'https://c4w17102.americas.hpqcorp.net'
                    },
                    ENV: {
                        siteRelativeUrl: "/teams/ESSolutionSource",
                        siteAbsoluteUrl: "https://ent302.sharepoint.hp.com/teams/ESSolutionSource",
                        SectionLoaderUrl: "/teams/ESSolutionSource/SitePages/SDSectionLoader.aspx",
                        SDContentsUrl: "/teams/ESSolutionSource/SitePages/SDContents.aspx",
                        SDDocLibUrl: "/teams/ESSolutionSource/SSDocLib/"
                    }
                }
            }
        }
    }
};