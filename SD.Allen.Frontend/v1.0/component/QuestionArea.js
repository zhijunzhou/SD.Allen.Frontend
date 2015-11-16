/*
 *  Single question for SD.
on the web page, please use like below:
<sd-questionarea params="{title: 'test question', content: testquestion}"></sd-questionarea>
avaiable params:
title: question title (mandatory)
content: a ko.observable() used to store html content
hint: a place holder to show default message (todo)
mandatory: indicate whether the field should be mandatory (todo)
 * 
 */

define('component/QuestionArea', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        ko_tinyMCE = require('ko_tinyMCE'),
        appConfig = require('model/AppConfig'),
        appUtility = require('util/AppUtility'),
        requestAPI = require('model/RequestAPI'),
        ko_bootstrap = require('ko_bootstrap'),
        templateHtml = require("text!./QuestionAreaTemplate.html");

    //http://stackoverflow.com/questions/9956958/changing-the-position-of-bootstrap-popovers-based-on-the-popovers-x-position-in
    function option(newID)
    {
        //make the popover placement auto
        var options = {
            container: 'body',
            html: true,
            trigger: "click",
            placement: function (context, source) {
                var position = $(source).position();
                if (position.left > 515) {
                    return "left";
                }
                if (position.left < 515) {
                    return "right";
                }
                if (position.top < 110) {
                    return "bottom";
                }
                return "top";
            },
            content: function () {
                return $('#sd-wrapper-' + newID).html();
            }
        };
        return options;
    }

    function extractFileName(path) {
        //http://stackoverflow.com/questions/20537696/remember-and-repopulate-file-input
        if (path.substr(0, 12) == "C:\\fakepath\\")
            return path.substr(12); // modern browser
        var x;
        x = path.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return path.substr(x + 1);
        x = path.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return path.substr(x + 1);
        return path; // just the filename
    }

    function extractFileExtenionName(path) {
        var x;
        x = path.lastIndexOf('.');
        if (x >= 0) {
            return path.substr(x + 1);
        } else {
            return '';
        }
    }

    function initPopover(viewModel) {
        var element;
        element = $('[id="' + viewModel.guid + '"] a[rel=popover]')
        element.popover({
            html: true,
            trigger: 'hover focus',
            delay: {"hide":5000},
            placement: function (context, source) {
                var position = $(source).position();
                if (position.left > 515) {
                    return "left";
                }
                if (position.left < 515) {
                    return "right";
                }
                if (position.top < 110) {
                    return "bottom";
                }
                return "auto";
            },
            title: function () {
                var titleStr = '<table border="0" width="100%"><tr>';
                var filePath = $(this).data('file');
                titleStr += '<td>File Information: ';
                if (filePath != null) titleStr += extractFileName(filePath);
                titleStr += '</td><td class="text-right"><a class="close" contenteditable="false" role="button" name="closePop">&nbsp;&times;</a></td>';
                titleStr += '</tr></table>';
                return titleStr;
            },
            content: function () {
                var contentHtml = '<div contenteditable="false">', filePath, extension;
                filePath = $(this).data('file');
                extension = extractFileExtenionName(filePath).toLowerCase();
                //generate the full file path
                filePath = appConfig.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filePath;
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        contentHtml += '<img src="' + filePath + '" style="max-width:550px;max-height:550px;" />'
                        contentHtml += "<hr>";  
                        break;
                    case 'doc':
                    case 'docx':
                    case 'xls':
                    case 'xlsx':
                    case 'ppt':
                    case 'pptx':
                    case 'pdf':
                    default:
                        contentHtml += '<hr>';
                        break;
                }
                contentHtml += '<ul>';
                contentHtml += '<li><a href="' + filePath + '" title="' + filePath + '" download>Download a copy</a></li>';
                contentHtml += "<ul>";
                contentHtml += '<div class="text-right"><a style="cursor:hand;" class="btn btn-default" name="closePop">Close</a></div>';
                contentHtml += "</div>";
                return contentHtml;
            }
        }).mouseover(function (e) {
            if(e.target.nextSibling.id){
                $('[rel=popover]').each(function () {
                    
                    if (!$(this).is(e.target)) {
                        $(this).popover('hide');
                    }
                });
            }
            var offset = $('.popover').offset();
            if(offset.top < 30)
                $('.popover').offset({top:30});
        });
        
    }

    function nth_occurrence(string, substr) {
        var i = string.indexOf(substr);
        return string.substr(i+1, string.length);
    }

    //title="File Information: '+file.name+'" data-file="' + fileUrl + '"
    function insertAttachment(viewModel) {
        var file = viewModel.fileUploader.prop('files')[0],
            extension = extractFileExtenionName(file.name).toLowerCase();
        requestAPI.uploadtoSpecificFolder(appConfig.ListCollection.SSDocLib, "/" + viewModel.opptyID() + "/" + appConfig.ReleaseVersion, file.name, file).done(function (data) {
            //insert hyperlink to content
            if (data.status != undefined && data.status == 400) {
                requestAPI.errorUpdateSection(data,null,null);
            } else {
                var fileUrl = nth_occurrence(data.d.ServerRelativeUrl, '/' + appConfig.ReleaseVersion + '/');
                var fileHtml = '';
                var extPic = '.gif';
                if ("jpg;#png;#gif;#doc;#docx;#xls;#xlsx;#ppt;#pptx".indexOf(extension) == -1) {
                    if ("#pdf".indexOf(extension) !== -1) {
                        extPic = '.png';
                    } else {
                        extension = "disc";
                    }
                }

                fileHtml = '<a class="btn" rel="popover" data-file="' + fileUrl + '"><img style="width: 16px; height: 16px; border: 0" src="/_layouts/images/ic' + extension + extPic + '" /></a>';
                viewModel.editor.execCommand('mceInsertContent', false, fileHtml);
                initPopover(viewModel);
            }            
        });
    }

    function myCustomOnInit(idSec) {
        $('#' + idSec + ' .mceToolbar').hide();
    }

    function onViewModelPreLoad() {
    }

    function onViewModelLoaded(viewModel) {
        viewModel.opptyID(appUtility.getUrlParameter('OpptyID'));
        hidePopover();
    }

    function hidePopover() {
        $('.popover').popover('hide');
        $('.popover').remove();
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var barconf1 = "code | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify  bullist numlist outdent indent | table | link image sd-attachment";
        var barconf2 = "code | styleselect | numlist outdent indent | table link image sd-attachment";
        var barconf = "";
        if (params.inLoop) {
            barconf = barconf2;
        } else {
            barconf = barconf1;
        }
        var questionViewModel,
            viewModel = function (params, componentInfo) {
                var self = this;
                var nguid = appUtility.newGuid();
                self.areaID = ko.observable();
                self.inLoop = ko.observable(false);
                self.guid = 'sd-question-' + nguid;                
                self.config = {
                    selector: '#sd-question-' + nguid,
                    theme: "modern",
                    menubar: false,
                    statusbar: false,
                    inline: true,
                    object_resizing: "table",
                    fix_list_elements : true,
                    convert_urls:false,
                    end_container_on_empty_block:true,
                    fixed_toolbar_container:'#' + self.guid + '-container',
                    plugins: [
                        "advlist autolink lists link pagebreak table code",
                    ],
                    toolbar1: barconf,
                    image_advtab: true,
                    file_browser_callback: function (field_name, url, type, win) {
                        if (type == 'image') {
                            $('#sd-img-' + self.guid).click();
                        }
                        return false;
                    },                    
                    setup: function (ed) {
                        self.editor = ed;
                        self.fileUploader = $('#' + self.guid + '-file');
                        ed.addButton('sd-attachment', {
                            text: '',
                            icon: 'image',
                            tooltip: 'Add Attachment',
                            onclick: function () {
                                //reset html5 file uploader. http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
                                self.fileUploader.replaceWith(self.fileUploader = self.fileUploader.clone(true));
                                //show html5 file uploader
                                self.fileUploader.click();
                            }
                        });                        
                        ed.on('focus', function () {
                            initPopover(self);
                        });
                        ed.on('init', function () {
                            myCustomOnInit(self.guid);              
                        });
                        ed.on('mouseup', function (e) {                           
                            if (e.target.nodeName.toLowerCase() == 'a') {
                                if (e.target.name != "closePop")
                                    window.open(e.target.href, "_blank");
                            }
                        });
                        ed.on('mousedown', function (e) {
                            if (e.target.nodeName.toLowerCase() == 'a') {
                                if (e.target.name == "closePop") {
                                    e.preventDefault(); return;
                                }
                            }
                        });
                        ed.on('blur', function (e) {
                            $('.popover').popover('hide');
                            $('.popover').remove();
                        });
                        ed.on('keydown', function (args,event) {
                            if (ed.getBody().textContent != "")
                            {
                                var range = ed.selection.getRng();
                                if (range.startOffset === 0 && event.keyCode === 8) {
                                    args.preventDefault();
                                    //return false;
                                }
                            }
                        });
                    }
                };
                
                self.editor = {};
                self.fileUploader = {};
                self.title = ko.observable();
                self.opptyID = ko.observable();
                self.version = ko.observable(1);
                self.popoverInitialized = ko.observable(false);
                self.content = ko.observable();
                self.hint = ko.observable();
                self.mandatory = ko.observable(false);
                self.editable = ko.observable(false);
                self.attachmentSelected = function (e) {
                    insertAttachment(self);
                };
                self.viewExpand = ko.observable(false);//show or hide the icon
                self.editTimes = ko.observable(0);//record if it was the first time to edit the question
                self.answerVisible = ko.observable(true); //if the answer is visible

                self.isStartEdit = ko.computed(function () {
                    if (self.editTimes() == 0) {
                        if (params.content() == undefined || params.content() == "" || params.content() == "<p></p>") {
                            return false;
                        }
                        return true;
                    }
                    return self.answerVisible();
                });

                self.unfoldAnsw = function () { //Unfold or fold the answer
                    if (self.isStartEdit() == false) {
                        self.answerVisible(true);
                    } else {
                        self.answerVisible(false);
                    }
                    self.editTimes(1);
                }

                self.msoverHandler = function () { //mouse enter the question                   
                    self.viewExpand(true);
                }

                self.msoutHandler = function () { //mouse out the question
                    self.viewExpand(false);
                }

                self.msupHandler = function () { //click the question component
                    if (!self.isStartEdit() || !self.answerVisible()) return true;
                    return false;
                };


                if (params !== undefined) {
                    if (params.content != undefined && params.content != null) {
                        if (typeof params.content === 'function') {
                            self.content = params.content;
                            //var temp = JSON.stringify(ko.toJS(self.content));
                            //if(params.content() != undefined)
                            //    self.editTimes(1);
                        } else {
                            self.content = ko.observable(params.content);
                        }
                    }
                    if (params.editable !== undefined) {
                        self.editable(params.editable());
                    }
                    if (params.inLoop !== undefined) {
                        self.inLoop(params.inLoop);
                    }
                    if (params.title !== undefined) {
                        self.title(params.title);
                    }
                    if (params.opptyID !== undefined) {
                        self.opptyID(params.opptyID);
                    }
                    if (params.version !== undefined) {
                        self.version(params.version);
                    }
                    if (params.hint !== undefined) {
                        self.hint(params.hint);
                    }
                    if (params.mandatory !== undefined) {
                        self.mandatory(params.mandatory);
                    }
                }
                self.opptyID(appUtility.getUrlParameter('OpptyID'));
                //Close a Twitter Bootstrap Popover when Clicking Outside
                
                $(function () {
                    
                    $('body').on('click', function (e) {
                        if (self.editable() === true) {
                            $('[rel="popover"]').each(function () {
                                //the 'is' for buttons that trigger popups
                                //the 'has' for icons within a button that triggers a popup
                                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.btn').has(e.target).length === 0) {
                                    $(this).popover('hide');
                                }
                            });
                        }
                        if (e.target.name == 'closePop') {
                            $('.popover').popover('hide');
                        }
                    });
                    $('a[rel="popover"]').mouseenter(function (e) {
                        if (self.editable() === false) {
                            togglePopover($(this), $(this).attr('data-file'), self);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                    
                    
                });                
            };
        questionViewModel = new viewModel(params, componentInfo);
        onViewModelLoaded(questionViewModel);
        return questionViewModel;
    }

    function togglePopover(element,filename,viewModel) {
        element.popover({
            html: true,
            trigger: 'click',
            //delay: { "hide": 3000 },
            placement: 'auto',
            title: 'File Information:' + filename,
            content: function () {
                var contentHtml = '<div contenteditable="false">';
                var extension = '';
                extension = extractFileExtenionName(filename).toLocaleLowerCase();
                var filePath = appConfig.ENV.SDDocLibUrl + viewModel.opptyID() + "/" + filename;
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        contentHtml += '<img src="' + filePath + '" style="max-width:550px;max-height:550px;" />'
                        contentHtml += "<hr>";  
                        break;
                    case 'doc':
                    case 'docx':
                    case 'xls':
                    case 'xlsx':
                    case 'ppt':
                    case 'pptx':
                    case 'pdf':
                    default:
                        contentHtml += '<hr>';
                        break;
                }
                contentHtml += '<ul>';
                contentHtml += '<li><a href="' + filePath + '" title="' + filePath + '" download>Download a copy</a></li>';
                contentHtml += "<ul>";
                contentHtml += '<div class="text-right"><a style="cursor:hand;" class="btn btn-default closePop" name="closePop">Close</a></div>';
                contentHtml += "</div>";
                return contentHtml;

            }
        });        
    }

    return {
        name: ["QuestionArea", "sd-questionarea"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };

});