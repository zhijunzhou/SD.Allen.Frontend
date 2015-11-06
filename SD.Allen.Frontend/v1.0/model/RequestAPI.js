
define('model/RequestAPI', function (require) {
    "use strict";
    var $ = require("jquery"),
        appConfig = require('model/AppConfig');

    //var navTitle = [
    //    {sid:'0201', title:'Opportunity Overview'},
    //    {sid:'0202',title:'Pursuit Team Contacts'},
    //    {sid:'0301',title:'Client Overview and Decision Factors'},
    //    {sid:'030201',title:'HPE Win Strategy > Sales Approach'},
    //    {sid:'030202',title:'HPE Win Strategy > Competitors'},
    //    {sid:'030203',title:'HPE Win Strategy > Message Map/Value Proposition'},
    //    {sid:'030204',title:'HPE Win Strategy > Pricing Approach'},
    //    {sid:'040101',title:'Scope > All Offerings'},
    //    {sid:'040102',title:'Scope > Key Scope Items'},
    //    {sid:'0402',title:'Current State Client Architecture'},
    //    {sid:'040301',title:'Solution Approach > Summary'},
    //    {sid:'040302',title:'Solution Approach > Outsourcing CMO/TMO/FMO'},
    //    {sid:'040303',title:'Solution Approach > HR Solution'},
    //    {sid:'040304',title:'Solution Approach > HPE Internal Challenges and Constraints'},
    //    {sid:'040305',title:'Solution Approach > Design Parameters'},
    //    {sid:'040306',title:'Solution Approach > Deployment Strategy'},
    //    {sid:'040307',title:'Solution Approach > Additional Information'},
    //    {sid:'0404',title:'Innovative Aspects of the Solution'},
    //    {sid:'040501',title:'Delivery Strategies > Delivery Location Targets'},
    //    {sid:'040505',title:'Delivery Strategies > In-Scope Services Delivery Responsibility'},
    //    {sid:'040506',title:'Delivery Strategies > Client-Retained Services Delivery Responsibility'},
    //    {sid:'040503',title:'Delivery Strategies > ESM Tooling and Automation Approach'},
    //    {sid:'0406',title:'Key Client Constraints'},
    //    {sid:'0407',title:'Summary Costing & FTE Reports—Costing Approach'}
    //];

    function getSectionTitleBySid(navTitle,sid) {
        for (var i in navTitle) {
            if (navTitle[i].sid === sid) return navTitle[i].title;
        }
        return "Error Title";
    }

    //dynamic section switch
    function createSectionModel(pursuitClassfication, involvedGbu, appsInscope) {
        if (pursuitClassfication === undefined) pursuitClassfication == 'A';
        if (appsInscope === undefined || involvedGbu != 'apps') appsInscope = false;
        return [
            new SectionNavigator('0201', 'Opportunity Overview', '', '0202'),
            new SectionNavigator('0202', 'Pursuit Team Contacts', '0201', '0301'),
            new SectionNavigator('0301', 'Client Overview and Decision Factors', '0202', '030201'),
            new SectionNavigator('030201', 'HPE Win Strategy > Sales Approach', '0301', '030202'),
            new SectionNavigator('030202', 'HPE Win Strategy > Competitors', '030201', '030203'),
            new SectionNavigator('030203', 'HPE Win Strategy > Message Map/Value Proposition', '030202', '030204'),
            new SectionNavigator('030204', 'HPE Win Strategy > Pricing Approach', '030203', '040101'),
            new SectionNavigator('040101', 'Scope > All Offerings', '030204', '040102'),
            new SectionNavigator('040102', 'Scope > Key Scope Items', '040101', (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040301' :  '0402'),
            new SectionNavigator('0402', 'Current State Client Architecture', '040102', '040301'),
            new SectionNavigator('040301', 'Solution Approach > Summary', (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040102' : '0402', '040302'),
            new SectionNavigator('040302', 'Solution Approach > Outsourcing CMO/TMO/FMO', '040301', '040303'),
            new SectionNavigator('040303', 'Solution Approach > HR Solution', '040302', '040304'),
            new SectionNavigator('040304', 'Solution Approach > HPE Internal Challenges and Constraints', '040303', (involvedGbu == 'apps' && appsInscope) ? '040305' : '040307'),
            new SectionNavigator('040305', 'Solution Approach > Design Parameters', '040304', '040306'),
            new SectionNavigator('040306', 'Solution Approach > Deployment Strategy', '040305', '040307'),
            new SectionNavigator('040307', 'Solution Approach > Additional Information', (involvedGbu == 'apps' && appsInscope) ? '040306' : '040304', '0404'),
            new SectionNavigator('0404', 'Innovative Aspects of the Solution', '040307', '040501'),
            new SectionNavigator('040501', 'Delivery Strategies > Delivery Location Targets', '0404', '040505'),
            new SectionNavigator('040505', 'Delivery Strategies > In-Scope Services Delivery Responsibility', '040501', (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040503' : '040506'),
            new SectionNavigator('040506', 'Delivery Strategies > Client-Retained Services Delivery Responsibility', '040505', '040503'),
            new SectionNavigator('040503', 'Delivery Strategies > ESM Tooling and Automation Approach', (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '040505' : '040506', '0406'),
            //new SectionNavigator('040505', 'Delivery Strategies > Summary CMO/FMO Locations and Volumes', '040501', '040506'),
            //new SectionNavigator('040504', 'Delivery Strategies > Key SLAs, SLOs and KPIs', '040503', '040505'),
            new SectionNavigator('0406', 'Key Client Constraints', '040503', (pursuitClassfication == 'A' || pursuitClassfication == 'B') ? '0201' : '0407'),
            new SectionNavigator('0407', 'Summary Costing & FTE Reports—Costing Approach', '0406', '0201')
        ]
    }

    function SectionNavigator(sid, title, prevSid, nextSid) {
        return {
            sid: sid,
            title: title,
            prevSid: prevSid,
            nextSid: nextSid
        }
    }


    function sidBaseGbu(involvedGbu, appsInscope, nsid, sksid) {
        if (involvedGbu == 'apps' && appsInscope) {
            return sksid
        }
        return nsid
    }

    function newSid(pursuitClassfication, nsid, sksid) {
        if (pursuitClassfication == 'A' || pursuitClassfication == 'B') {
            return sksid
        }
        return nsid
    }

    //file and folder operatetion
        function uploadFile(libname,filename,file) {                
            uploadFileSync(libname, filename, file);
        }

        //foldername : /OPP-10872923/1
        function uploadtoSpecificFolder(libname, foldername, filename, file) {
            var dfd = $.Deferred();
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    var buffer = evt.target.result;
                    var completeUrl = _spPageContextInfo.siteServerRelativeUrl
                      + "/_api/web/getfolderbyserverrelativeurl('" + libname + foldername + "')/files"
                      + "/add(overwrite=true,url='" + filename + "')";

                    $.ajax({
                        url: completeUrl,
                        type: "POST",
                        data: buffer,
                        processData: false,
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        },
                        success: function (data) {
                            dfd.resolve(data);
                        },
                        complete: function (data) {
                            dfd.resolve(data);
                        },
                        error: function (err) {
                            dfd.resolve(err);
                        }
                    });
                }
            };
            reader.readAsArrayBuffer(file);
            return dfd.promise();
        }

        //Upload file synchronously
        function uploadFileSync(libname, filename, file) {
            var dfd = $.Deferred();
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    var buffer = evt.target.result;
                    var completeUrl = _spPageContextInfo.siteServerRelativeUrl
                      + "/_api/web/lists/getByTitle('" + libname + "')"
                      + "/RootFolder/Files/add(url='" + filename + "',overwrite='true')";

                    $.ajax({
                        url: completeUrl,
                        type: "POST",
                        data: buffer,
                        processData: false,
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),                        
                        },
                        success : function(data) {
                            dfd.resolve(data);
                        },
                        complete: function (data) {
                            dfd.resolve(data);
                        },
                        error: function (err) {
                            dfd.resolve(err);
                        }
                    });
                }
            };
            reader.readAsArrayBuffer(file);
            return dfd.promise();
        }

        function createFolder(libname, opptyId, version) {
            var dfd = $.Deferred();
            var url = _spPageContextInfo.siteServerRelativeUrl
            + "/_api/web/lists/getByTitle('" + libname + "')"
            + "/RootFolder/Folders/add(url='" + opptyId + "')";
            $.ajax({
                "url": url,
                "type": "POST",
                "headers": {
                    "accept": "application/json; odata=verbose",
                    "content-type": "application/json; odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    //dfd.resolve(data);
                    createSubFolder(libname, opptyId, version);
                },
                complete: function (data) {
                    dfd.resolve(data);
                },
                error: function (err) {
                    dfd.resolve(err);
                }
            });
        }    
    
        function createSubFolder(libname, opptyId, version) {
        var dfd = $.Deferred();
        var url = _spPageContextInfo.siteServerRelativeUrl
            + "/_api/Web/Folders/add('"+libname+"/"+opptyId+"/"+version+"')";
        $.ajax({
            "url": url,
            "type": "POST",
            "headers": {
                "accept": "application/json; odata=verbose",
                "content-type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                dfd.resolve(data);
            },
            complete: function (data) {
                dfd.resolve(data);
            },
            error: function (err) {
                dfd.resolve(err);
            }
        });
    }
    
        function getAllAttachments(opptyId) {
            var dfd = $.Deferred();
            var ver = appConfig.ReleaseVersion;
            var libname = appConfig.ListCollection.SSDocLib;
            var url = _spPageContextInfo.siteServerRelativeUrl
            + "/_api/web/getfolderbyserverrelativeurl('"+libname+"/"+opptyId+"/"+ver+"')/Files";
            $.ajax({
                url: url,
                type: "get",
                dataType: "JSON",
                headers: {
                    "accept": "application/JSON;odata=verbose",
                    "content-type": "application/JSON;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    dfd.resolve(data);
                },
                error: function (err) {
                    dfd.resolve(err);
                }
            });
            return dfd.promise();
        }

    //Oppty operation
        function getAllOpptyAsync() {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents',
                method: 'GET',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        function getMyOpptyAsyc() {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/my',
                method: 'GET',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        function createOpptyDocument(data) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents',
                method: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });            
            return dfd.promise();
        }

        function getOpptyByIDAsync(opptyID) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID,
                method: 'GET',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data, xhr);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        function getOpptyByIDSync(opptyID) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID,
                method: 'GET',
                async:false,
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data, xhr);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        function getSectionByIDAndSectionNameAsync(opptyID, sectionName) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/'+ sectionName,
                method: 'GET',
                contentType: 'application/json',
                headers: {

                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data, xhr);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        function getSectionByIDAndSectionNameSync(opptyID, sectionName) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/' + opptyID + '/sections/' + sectionName,
                method: 'GET',
                async: false,
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }
            }).done(function (data, status, xhr) {
                dfd.resolve(data, xhr);
            }).fail(function (xhr) {
                dfd.resolve(xhr);
            });
            return dfd.promise();
        }

        //section : update section data
        function updateSection(opptyID,sectionName,section,eTag) {
            var dfd = $.Deferred();
            $.ajax({
                url: appConfig.ApiStaging.Staging1 + '/api/documents/'+opptyID+'/sections/'+ sectionName,
                method: 'POST',
                data: JSON.stringify(section),
                contentType: 'application/json',
                headers: {
                    'If-Match': eTag,
                    'Authorization': 'Basic ' + btoa(_hpUserName + ':K8gNpSnj3p')
                }, 
                success: function (data, textStatus, jqXHR) {
                    dfd.resolve(data, textStatus, jqXHR);
                },
                error: function (xhr) {
                    dfd.resolve(xhr);
                }
            });
            return dfd.promise();
        }

    //error message processing
        function errorOppty(code) {
            switch (code) {
                case '400': 
                    alert("You don't have OpptyID in your url! You will redirect to My Opportunity Page!"); 
                    window.location.href = appConfig.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;
                case '404':
                    alert("OpptyID is not avaiable! Please try another or navigator to home page!");
                    window.location.href = appConfig.ENV.siteRelativeUrl + "/SitePages/SDMyOppty.aspx"; break;                
                default: break;
            }
        }

        function errorUpdateSection(data, sid, opptyID) {
            var navTitle = createSectionModel(undefined,undefined,undefined);
            var secName = sid != null ? getSectionTitleBySid(navTitle,sid) : "";
            //var secName = sid != null ? getSectionTitleBySid(sid) : "";
            var updateMsg = "";
            var error = 0;
            if (data == undefined) {
                error = 0;
                updateMsg = "Update Section (" + secName + ") Successfully!";
            } else if (data.status >= 400 && data.status < 500) {
                error = data.status;
                if (sid == null) {
                    updateMsg = "Error: The length of the URL for this request exceeds the configured maxUrlLength value or object file too large .";
                } else {
                    var errorText = JSON.parse(data.responseText);
                    updateMsg = "Error: " + error + " Section: " + secName + ", Message: " + errorText.Message;
                }
            } else if (data.status >= 500) {
                error = data.status;
                updateMsg = "Error occur in the server, please contact the server administrator!";
            }
            $(window).trigger("generateMsg", [secName, error, updateMsg]);
            FixWorkspace();
        }

        function FixWorkspace() {
            // if you are using a header that is affixed to the top (i.e. SharePoint Ribbon) put the ID or class here to change the workspace height accordingly.
            var header = '#suiteBar';
            var width = $(window).width();
            var height;
            if ($(header).length) {
                height = $(window).height() - $(header).height();
            } else {
                height = $(window).height();
            }
            $('#s4-workspace').width(width).height(height);
        }

        return {
            createSectionModel: createSectionModel,
            createFolder: createFolder,
            uploadFile: uploadFile,
            uploadtoSpecificFolder: uploadtoSpecificFolder,
            createOpptyDocument: createOpptyDocument,
            getAllAttachments:getAllAttachments,
            getAllOpptyAsync: getAllOpptyAsync,
            getMyOpptyAsyc:getMyOpptyAsyc,
            getSectionByIDAndSectionNameAsync: getSectionByIDAndSectionNameAsync,
            getSectionByIDAndSectionNameSync:getSectionByIDAndSectionNameSync,
            getOpptyByIDAsync: getOpptyByIDAsync,
            updateSection: updateSection,
            errorOppty: errorOppty,
            getOpptyByIDSync:getOpptyByIDSync,
            errorUpdateSection: errorUpdateSection,
            FixWorkspace: FixWorkspace
    }

});
