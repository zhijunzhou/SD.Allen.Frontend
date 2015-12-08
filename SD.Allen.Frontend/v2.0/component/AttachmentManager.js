define('component/AttachmentManager', function (require) {
    "use strict";
    var $ = require("jquery"),
        ko = require("knockout"),
        jasnybs = require('jasnybs'),
        templateHtml = require("text!./AttachmentManagerTemplate.html"),
		requestAPI = require('model/RequestAPI'),

        appUtility = require('util/AppUtility'),
        vm = {};

    function listenCustomEvent() {
        $(window).off("sectionChanging");
        $(window).on("opptySaving", function () {
            $(document).undelegate('[id^=sd-file-]', 'click');
            if (vm.attachmentVisible) {
                hideAttachment();
            }
        });
    }

    function attachment(title, link, fileName, fileUrl, fileTag) {
        this.title = title;
        this.link = link;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileTag = fileTag;
    }

    function onViewModelPreLoad() {
        listenCustomEvent();
        $(function ($) {
            $(window).bind('mousewheel', function (event, delta) {
                if (vm.attachmentVisible) {
                    hideAttachment();
                }
            });
        });
    }

    function showAttachment() {
        $('.popover-option').popover('show');
        vm.attachmentVisible = true;
    }

    function hideAttachment() {
        $('.popover-option').popover('hide');
        vm.attachmentVisible = false;
    }

    function onViewModelLoaded() {
        function initPopover() {
            $(".popover-option").popover({
                html: true,
                content: function () {
                    return $("#div-attachmentReview").html();
                }
            });
        }
        $(initPopover());
        var regx = /^sd-file-.*/;

        $('.popover-option').off("click");
        $('.popover-option').click(function (e) {
            $('.popover-option').popover('toggle');
            e.stopPropagation();
            if (vm.attachmentVisible) {
                hideAttachment();
            } else {
                showAttachment();
            }
        });

        //$(document).off('[id^=sd-file-]', 'click');
        $(document).delegate('[id^=sd-file-]', 'click', function (e) {
            e.stopPropagation();
            var idStr = $(this).attr('id');
            var index = idStr.substring(8);
            vm.removeFile(index);
            showAttachment();
            return;
        });

        $(document).delegate('#sd-popover-close', 'click', function (e) {
            e.stopPropagation();
            $('.popover-option').popover('toggle');
            hideAttachment();
        });

        if (!vm.editable()) {
            initFileList();
        }
    }

    function initFileList() {
        vm.fileList([]);
        for (var i in vm.attachment()) {
            var fileTag = computePicSrc(vm.attachment()[i].title);
            vm.fileList.push(new attachment(vm.attachment()[i].title, vm.linkBaseUrl + vm.attachment()[i].title, vm.attachment()[i].title, vm.attachmentBaseUrl() + vm.attachment()[i].title, fileTag));
        }
    }

    function updateFileList() {
        if (!vm.attachmentLoaded) {
            initFileList();
            vm.attachmentLoaded = true;
        }
    }

    function uploader(vm) {
        var me = this;
        me.guid = 'sd-clientArchitecture-' + appUtility.newGuid();
        me.baseUrl = "/" + vm.section.opptyID + "/";
        me.attachmentSelected = function (e) {
            insertAttachment(me);
        };
        me.chooseFile = function () {
            $('#' + me.guid + '-file').click();
        }
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

    function computePicSrc(fileName) {
        var extension = extractFileExtenionName(fileName).toLowerCase();
        var extPic = '.gif';
        if ("jpg;#png;#gif;#doc;#docx;#xls;#xlsx;#ppt;#pptx".indexOf(extension) == -1) {
            if ("#pdf".indexOf(extension) !== -1) {
                extPic = '.png';
            } else {
                extension = "disc";
            }
        }
        var fileTag = '/_layouts/images/ic' + extension + extPic;
        return fileTag;
    }

    function insertAttachment(uploader) {
        var file = $('#' + uploader.guid + '-file').prop('files')[0];
        sp.app.fileUploadinDialog.show("Uploading files ...");
        requestAPI.uploadtoSpecificFolder(sp.app.config.ListCollection.SSDocLib, uploader.baseUrl + sp.app.config.ReleaseVersion, file.name, file).done(function (data) {
            sp.app.fileUploadinDialog.hide("Uploading files ...");
            var fileUrl = data.d.ServerRelativeUrl;
            var fileTag = computePicSrc(file.name);
            vm.attachment.push({ title: file.name, link: sp.app.config.ReleaseVersion + "/" + file.name });
            if (vm.attachmentLoaded) {
                vm.fileList.push(new attachment(file.name, sp.app.config.ReleaseVersion + "/" + file.name, file.name, fileUrl, fileTag));
            }
            showAttachment();
        });
    }

    function createViewModel(params, componentInfo) {
        onViewModelPreLoad();
        var attachmentManagerViewModel = function (params) {
            var self = this;

            self.linkBaseUrl = "/" + params.viewModel.section.opptyID + "/";
            self.attachmentBaseUrl = ko.observable(sp.app.config.ENV.SDDocLibUrl + params.viewModel.section.opptyID + "/" + sp.app.config.ReleaseVersion + "/");

            self.attachment = params.viewModel.section.data.attachment;
            self.editable = params.viewModel.editable;
            self.attachment.subscribe(updateFileList);
            self.fileList = ko.observableArray();
            self.fileUploader = new uploader(params.viewModel);

            self.attachmentLoaded = false;
            self.attachmentVisible = false;
            //define functions;
            self.removeFile = function (index) {
                var tempAttachment = self.attachment();
                tempAttachment.splice(index, 1);
                self.attachment(tempAttachment);

                var tempFileList = self.fileList();
                tempFileList.splice(index, 1);
                self.fileList(tempFileList);
            };
        };
        vm = new attachmentManagerViewModel(params);
        onViewModelLoaded();
        return vm;
    }

    return {
        name: ["AttachmentManager", "sd-component-attachmentmanager"],
        template: templateHtml,
        viewModel: {
            createViewModel: createViewModel
        }
    };
});