(function () {
    "use strict";
    "ver 2015.6.13";

    var exports = {
        getListItems: getListItems,
        getListItemById: getListItemById,
        createListItem: createListItem,
        updateListItem: updateListItem,
        deleteListItems: deleteListItems,
        getListDispFormUrl: getListDispFormUrl,
        getAllFieldsOfList: getAllFieldsOfList,
        getUser: getUser,
        getAttachmentFiles: getAttachmentFiles,
        setListItemPermissions: setListItemPermissions
    };

    //
    // permissions: [
    //   { userLoginName: "domain\user", roles: ["administrator", "webDesigner"] },
    //   { userId: 3, roles: ["contributor", "reader"] },
    //   { groupName: "Site Admins Group", roles: ["guest", "none"] },
    //   { groupId: 1, roles: ["Custom Permission Level"] }
    // ]
    //
    function setListItemPermissions(listTitle, listItemId, permissionInfos, callback) {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var ctx = SP.ClientContext.get_current(),
                web = ctx.get_web(),
                list = web.get_lists().getByTitle(listTitle),
                listItem = list.getItemById(listItemId),
                i, j, roleBindings;

            ensureBreakRoleInheritance(ctx, listItem, function() {

                //for (i = 0; i < permissionInfos.length; i++) {
                //    roleBindings = SP.RoleDefinitionBindingCollection.newObject(ctx);
                //    for (j = 0; j < permissionInfos[i].roles; j++) {
                //        roleBindings.add(getRole(permissionInfos[i].roles[j]));
                //    }

                //    listItem.get_roleAssignments().add(resolvePrincipal(web, permissionInfos[i]), roleBindings);
                //}
                
                setSecurableObjectPermissions(ctx, listItem, permissionInfos, function() {
                    callback && callback();
                });                

            });

        }, "SP.js");
    }

    function ensureBreakRoleInheritance(clientCtx, securableObj, callback) {
        clientCtx.load(securableObj, "HasUniqueRoleAssignments");
        clientCtx.executeQueryAsync(function () {

            if (securableObj.get_hasUniqueRoleAssignments()) {
                callback && callback(true);
                return;
            }

            securableObj.breakRoleInheritance(false, true);
            clientCtx.executeQueryAsync(function() {

                callback && callback(true);

            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback && callback(false);
            });

        }, function (sender, args) {
            logJSOMQueryError(sender, args);
            callback && callback(false);
        });
    }

    function setSecurableObjectPermissions(clientCtx, securableObj, permissionInfos, callback) {
        var roleAssigns = securableObj.get_roleAssignments(),
            i, j, roleBindings, roleAssign;

        clientCtx.load(roleAssigns);
        clientCtx.executeQueryAsync(function() {

            while (roleAssigns.get_count() > 0) {
                roleAssign = roleAssigns.itemAt(0);
                roleAssign.deleteObject();
            }

            for (i = 0; i < permissionInfos.length; i++) {
                if (permissionInfos[i].roles.length > 0) {
                    roleBindings = SP.RoleDefinitionBindingCollection.newObject(clientCtx);
                    for (j = 0; j < permissionInfos[i].roles.length; j++) {
                        roleBindings.add(getRole(clientCtx.get_web(), permissionInfos[i].roles[j]));
                    }

                    roleAssigns.add(resolvePrincipal(clientCtx.get_web(), permissionInfos[i]), roleBindings);
                }
            }

            clientCtx.executeQueryAsync(function() {
                callback && callback(true);
            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback && callback(false);
            });

        }, function(sender, args) {
            logJSOMQueryError(sender, args);
            callback && callback(false);
        });
    }

    function resolvePrincipal(web, permissionObj) {
        if (typeof permissionObj.userLoginName === "string") {
            return web.ensureUser(permissionObj.userLoginName);
        } else if (typeof permissionObj.userId === "number") {
            return web.getUserById(permissionObj.userId);
        } else if (typeof permissionObj.groupName === "string") {
            return web.get_siteGroups().getByName(permissionObj.groupName);
        } else if (typeof permissionObj.groupId === "number") {
            return web.get_siteGroups().getById(permissionObj.groupName);
        } else {
            return null;
        }
    }

    function getRole(web, typeNameOrName) {
        switch (typeNameOrName) {
            case "administrator":
                return web.get_roleDefinitions().getByType(SP.RoleType.administrator);
            case "webDesigner":
                return web.get_roleDefinitions().getByType(SP.RoleType.webDesigner);
            case "contributor":
                return web.get_roleDefinitions().getByType(SP.RoleType.contributor);
            case "reader":
                return web.get_roleDefinitions().getByType(SP.RoleType.reader);
            case "guest":
                return web.get_roleDefinitions().getByType(SP.RoleType.guest);
            case "none":
                return web.get_roleDefinitions().getByType(SP.RoleType.none);
            default:
                return web.get_roleDefinitions().getByName(typeNameOrName);
        }
    }

    /*
        return : [ {
            name: "",
            serverRelativeUrl: ""
        } ]
     */
    function getAttachmentFiles(listTitle, listItemId, callback) {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var ctx = SP.ClientContext.get_current(),
                web = ctx.get_web(),
                list = web.get_lists().getByTitle(listTitle),
                listRootFolder = list.get_rootFolder(),
                listRootFolderUrl, attachmentFolderUrl, attachmentFolder, files,
                result = [];

            ctx.load(listRootFolder, "ServerRelativeUrl");

            ctx.executeQueryAsync(function() {

                listRootFolderUrl = listRootFolder.get_serverRelativeUrl();
                attachmentFolderUrl = listRootFolderUrl + "/Attachments/" + listItemId.toString();
                attachmentFolder = web.getFolderByServerRelativeUrl(attachmentFolderUrl);
                files = attachmentFolder.get_files();

                ctx.load(files);
                ctx.executeQueryAsync(function() {
                    files = mapJsomCollectionToArray(files);
                    mapArray(files, function(file) {
                        result.push({
                            name: file.get_name(),
                            serverRelativeUrl: file.get_serverRelativeUrl()
                        });
                    });
                    callback(result);
                }, function(sender, args) {
                    logJSOMQueryError(sender, args);
                    callback([]);
                });

            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback([]);
            });

        }, "SP.js");
    }

    /*
        return {
            success: true,
            errorMessage: "",
            listItemId: 0
        }
     */
    function createListItem(listTitle, data, callback) {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var ctx = SP.ClientContext.get_current(),
                list = ctx.get_web().get_lists().getByTitle(listTitle),
                itemCreateInfo = new SP.ListItemCreationInformation(),
                newItem = list.addItem(itemCreateInfo),
                p;

            for (p in data) {
                if (data.hasOwnProperty(p)) {
                    newItem.set_item(p, data[p]);
                }
            }

            newItem.update();
            ctx.load(newItem);

            ctx.executeQueryAsync(function() {
                callback({
                    success: true,
                    errorMessage: "",
                    listItemId: newItem.get_id()
                });
            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback({
                    success: false,
                    errorMessage: args.get_message(),
                    listItemId: -1
                });
            });

        }, "SP.js");
    }

    /*
        listTitle: title of list
        data: a plain object with field/value pairs, id field will be used to find target list item
        return: {
            success: true,
            errorMessage: "",
            listItemId: 0
        }
     */
    function updateListItem(listTitle, data, callback) {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var ctx = SP.ClientContext.get_current(),
                list = ctx.get_web().get_lists().getByTitle(listTitle),
                listItem = list.getItemById(data.id),
                p;

            for (p in data) {
                if (data.hasOwnProperty(p) && p !== "id") {
                    listItem.set_item(p, data[p]);
                }
            }

            listItem.update();

            ctx.executeQueryAsync(function() {
                callback({
                    success: true,
                    errorMessage: "",
                    listItemId: data.id
                });
            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback({
                    success: false,
                    errorMessage: args.get_message(),
                    listItemId: data.id
                });
            });

        }, "SP.js");
    }

    /*
        ids: an number or an array of numbers
        return: {
            success: true,
            errorMessage: "",
            listItemIds: []
        }
     */
    function deleteListItems(listTitle, ids, callback) {
        ExecuteOrDelayUntilScriptLoaded(function() {
            var ctx = SP.ClientContext.get_current(),
                list = ctx.get_web().get_lists().getByTitle(listTitle),
                listItem, i;

            if (!isArray(ids)) {
                ids = [ids];
            }

            for (i = 0; i < ids.length; i++) {
                listItem = list.getItemById(ids[i]);
                listItem.deleteObject();
            }

            ctx.executeQueryAsync(function() {
                callback({
                    success: true,
                    errorMessage: "",
                    listItemIds: ids
                });
            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback({
                    success: false,
                    errorMessage: args.get_message(),
                    listItemIds: ids
                });
            });

        }, "SP.js");
    }

    /*
        return a string
     */
    function getListDispFormUrl(listTitle, success) {
        ExecuteOrDelayUntilScriptLoaded(function () {
                var ctx = SP.ClientContext.get_current();
                var web = ctx.get_web();
                var list = web.get_lists().getByTitle(listTitle);
                ctx.load(list, "DefaultDisplayFormUrl");
                ctx.executeQueryAsync(function () {
                    success(list.get_defaultDisplayFormUrl());
                }, function (sender, args) {
                    success(null);
                });
            }, "SP.js");
    }

    /*
        return : a plain object
     */
    function getListItemById(listTitle, id, includeFields, callback) {
        var queryOption = {
            listTitle: listTitle,
            includeFields: includeFields,
            camlWhere: "<Where><Eq><FieldRef Name='ID' /><Value Type='Counter'>" + id.toString() + "</Value></Eq></Where>"
        };

        getListItems(queryOption, function(listItems) {
            callback(listItems.length > 0 ? listItems[0] : null);
        });
    }

    function getListItemsByIds(listTitle, ids, includeFields, callback) {

    }

    /*
        queryOption : {
            listTitle: "",
            includeFields: [],
            camlWhere: "",
            camlOrderBy: "",
            rowLimit: 1000,
            pagingInformation: {}
        }
        return : an array with following extra fields:
            pagingInformation: {} (or null)
     */
    function getListItems(queryOption, callback) {
        var result,
            autoBatchRetriving = !queryOption.rowLimit && !queryOption.pagingInformation;

        if (!queryOption.listTitle) {
            log("Not specify queryOption.listTitle.");
            callback([]);
            return;
        }

        if (autoBatchRetriving) {
            queryListItemsWithAutoBatchRetriving(queryOption, null, function (listItems) {
                result = buildResult(listItems);
                callback(result);
            });
        } else {
            queryListItems(queryOption, function (listItems) {
                result = buildResult(listItems);
                callback(result);
            });
        }

        function buildResult(listItems) {
            var result = [];
            if (listItems !== null) {
                result = mapArray(listItems, function (listItem, i) {
                    return buildEntityFromListItem(listItem, queryOption.includeFields);
                });
                result.pagingInformation = listItems.pagingInformation;
            }
            return result;
        }
    }

    /*
        userId: an number or a SP.FieldUserValue, if pass in null or 0, return current user
        return: a SP.User object with extra properties
     */
    function getUser(userId, callback) {
        ExecuteOrDelayUntilScriptLoaded(function () {
            var ctx = SP.ClientContext.get_current(),
                web = ctx.get_web(),
                user;

            if (typeof userId === "number") {
                user = userId > 0 ? web.getUserById(userId) : web.get_currentUser();
            } else if (typeof userId === "object" && userId !== null && userId instanceof SP.FieldUserValue) {
                user = web.getUserById(userId.get_lookupId());
            } else {
                user = web.get_currentUser();
            }

            ctx.load(user);
            ctx.executeQueryAsync(function() {
                user.id = user.get_id();
                user.email = user.get_email();
                user.isSiteAdmin = user.get_isSiteAdmin();
                user.isHiddenInUI = user.get_isHiddenInUI();
                user.loginName = user.get_loginName();
                user.principalType = user.get_principalType();
                user.title = user.get_title();
                callback(user);
            }, function(sender, args) {
                logJSOMQueryError(sender, args);
                callback(null);
            });            

        }, "SP.js");
    }

    /*
        return : [{            
            title: "",
            internalName: ""
        }]
     */
    function getAllFieldsOfList(listTitle, success) {
        ExecuteOrDelayUntilScriptLoaded(function () {
            var ctx = SP.ClientContext.get_current();
            var web = ctx.get_web();
            var list = web.get_lists().getByTitle(listTitle);
            var fields = list.get_fields();

            ctx.load(fields, "Include(Title, InternalName)");

            ctx.executeQueryAsync(function () {
                var result = mapArray(
                        mapJsomCollectionToArray(fields),
                        function(ele, i) {
                            return {
                                title: ele.get_title(),
                                internalName: ele.get_internalName()
                            };
                        });
                success(result);
            }, function (sender, args) {
                window.console && console.log(args.get_message());
                success(null);
            });
        }, "SP.js");
    }

    function buildEntityFromListItem(listItem, fields) {
        var entity = { id: listItem.get_id() },
            fieldValues = listItem.get_fieldValues(),
            i, p, field, fieldValue;

        for (p in fieldValues) {
            if (fieldValues.hasOwnProperty(p)) {
                entity[p] = fieldValues[p];
            }
        }

        if (fields) {
            for (i = 0; i < fields.length; i++) {
                field = fields[i];
                fieldValue = getFieldValueOfListItem(listItem, field);
                entity[field] = fieldValue;
            }
        }

        return entity;
    }

    function getFieldValueOfListItem(listItem, field) {
        var fieldValue = null;

        try {
            fieldValue = listItem.get_item(field);
            if (fieldValue) {
                fieldValue = parseFieldValue(fieldValue);
                return fieldValue;
            } else {
                return null;
            }
        } catch (e) {
            log("Cannot get field value from a list item. The field is '" + field + "'.");
            return null;
        }
    }

    function parseFieldValue(value) {
        if (typeof value.get_lookupValue !== "undefined") {
            value.lookupId = value.get_lookupId();
            value.lookupValue = value.get_lookupValue();
            return value;
        } else if (typeof value.get_url !== "undefined") {
            return {
                url: value.get_url(),
                description: value.get_description()
            };
        } else if (isArray(value)) {
            return value;
        } else if (value instanceof Date) {
            return value;
        } else if (typeof value === "number") {
            return value;
        }

        value = value.toString();

        if (value.indexOf(";#") > -1) {
            var valueArray = value.split(";#");
            var result = grepArray(valueArray, function (v, i) {
                return v && (v.length > 0);
            });
            if (result.length > 0) {
                return result;
            } else {
                return result[0];
            }
        }

        return value;
    }

    function queryListItems(queryOption, callback) {
        ExecuteOrDelayUntilScriptLoaded(function () {
            var ctx = SP.ClientContext.get_current(),
                web = ctx.get_web(),
                list = web.get_lists().getByTitle(queryOption.listTitle),
                rowLimitXml = "",
                queryXml = "",
                viewXml = "",
                camlQuery = new SP.CamlQuery(),
                listItems = null,
                include = buildInclude(queryOption.includeFields),
                result = [];

            if (queryOption.rowLimit) {
                rowLimitXml = "<RowLimit>" + queryOption.rowLimit.toString() + "</RowLimit>";
            }

            if (queryOption.camlWhere || queryOption.camlOrderBy) {
                queryXml = "<Query>";
                if (queryOption.camlWhere) {
                    queryXml += queryOption.camlWhere;
                }
                if (queryOption.camlOrderBy) {
                    queryXml += queryOption.camlOrderBy;
                }
                queryXml += "</Query>";
            }
            viewXml = "<View>" +
                        queryXml +
                        rowLimitXml +
                      "</View>";
            
            camlQuery.set_viewXml(viewXml);
            if (queryOption.pagingInformation) {
                camlQuery.set_listItemCollectionPosition(queryOption.pagingInformation);
            }

            listItems = list.getItems(camlQuery);
            if (include) {
                ctx.load(listItems, include, "ListItemCollectionPosition");
            } else {
                ctx.load(listItems);
            }

            ctx.executeQueryAsync(function () {
                pushItemsIntoArray(result, mapJsomCollectionToArray(listItems));
                result.pagingInformation = listItems.get_listItemCollectionPosition();
                callback(result);
            }, function (sender, args) {
                logJSOMQueryError(sender, args);
                callback([]);
            });
        }, "SP.js");
    }

    function queryListItemsWithAutoBatchRetriving(queryOption, pagingInformation, callback) {
        ExecuteOrDelayUntilScriptLoaded(function () {
            var ctx = SP.ClientContext.get_current(),
                web = ctx.get_web(),
                list = web.get_lists().getByTitle(queryOption.listTitle),
                rowLimitXml = "",
                queryXml = "",
                viewXml = "",
                camlQuery = new SP.CamlQuery(),
                listItems = null,
                include = buildInclude(queryOption.includeFields),
                batchSize = 50,
                result = [];

            rowLimitXml = "<RowLimit>" + batchSize.toString() + "</RowLimit>";

            if (queryOption.camlWhere || queryOption.camlOrderBy) {
                queryXml = "<Query>";
                if (queryOption.camlWhere) {
                    queryXml += queryOption.camlWhere;
                }
                if (queryOption.camlOrderBy) {
                    queryXml += queryOption.camlOrderBy;
                }
                queryXml += "</Query>";
            }
            viewXml = "<View>" +
                        queryXml +
                        rowLimitXml +
                      "</View>";
            
            camlQuery.set_viewXml(viewXml);
            if (pagingInformation) {
                camlQuery.set_listItemCollectionPosition(pagingInformation);
            }

            listItems = list.getItems(camlQuery);
            if (include) {
                ctx.load(listItems, include, "ListItemCollectionPosition");
            } else {
                ctx.load(listItems);
            }

            ctx.executeQueryAsync(function () {

                pushItemsIntoArray(result, mapJsomCollectionToArray(listItems));
                result.pagingInformation = null;

                if (listItems.get_listItemCollectionPosition()) {
                    queryListItemsWithAutoBatchRetriving(queryOption, listItems.get_listItemCollectionPosition(), function(nextBatchListItems) {
                        pushItemsIntoArray(result, nextBatchListItems);
                        callback(result);
                    });
                } else {
                    callback(result);
                }

            }, function (sender, args) {
                logJSOMQueryError(sender, args);
                callback([]);
            });
        }, "SP.js");
    }

    function buildInclude(includeFields) {
        if (includeFields && (includeFields.length > 0)) {
            return "Include(Id, " + includeFields.join(", ") + ")";
        } else {
            return null;
        }
    }

    function mapJsomCollectionToArray(col) {
        var result = [];
        for (var i = 0; i < col.get_count() ; i++) {
            result.push(col.itemAt(i));
        }
        return result;
    }

    function mapArray(array, mapFunc) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(mapFunc(array[i], i));
        }
        return result;
    }

    function grepArray(array, grepFunc) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            if (grepFunc(array[i], i) === true) {
                result.push(array[i]);
            }
        }
        return result;
    }

    function isArray(value) {
        return value instanceof Array || 
            (typeof value === "object" &&
            typeof value.length === "number" &&
            typeof value.join === "function" &&
            typeof value.push === "function" &&
            typeof value.pop === "function");
    }

    function pushItemsIntoArray(arr, moreItems) {
        var i;
        for (i = 0; i < moreItems.length; i++) {
            arr.push(moreItems[i]);
        }
        return arr;
    }

    function logJSOMQueryError(sender, args) {
        log("JSOM Query Failed. " + args.get_message());
    }

    function log(msg) {
        switch (typeof msg) {
            case "undefined":
                msg = "undefined";
                break;
            case "string":
                break;
            case "object":
                if (msg === null) {
                    msg = "null";
                } else if (msg instanceof Error) {
                    msg = "Error: " + msg.message + '\n' + msg.stack;
                } else if (typeof JSON === "object") {
                    msg = JSON.stringify(msg);
                } else {
                    msg = msg.toString();
                }
                break;
            default:
                msg = msg.toString();
                break;
        }
        
        if (typeof console !== "undefined") {
            console.log(msg);
        }
    }


    if (typeof define === 'function' && define['amd']) {
        define(function () {
            window["$SPDataReader"] = exports;
            return exports;
        });
    } else {
        window["$SPDataReader"] = exports;
    }

}());
