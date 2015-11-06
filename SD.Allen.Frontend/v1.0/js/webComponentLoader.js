define(function (require) {
    "use strict";

    var exports = {
        load: load
    };

    //
    //  option: {
    //    container: "#containerId",
    //    componentModule: "module name of web component",
    //    componentParams: {}
    //  }
    //
    function load(option, callback) {
        var container, dataBindValue;

        if (!option ||
            !option.container ||
            !option.componentModule) {
            throw new Error("parameter invalid for webComponentLoader.load().");
        }


        require(["knockout", option.componentModule], function (ko, component) {


            if (!component) {
                throw new Error("cannot load web component '" + option.componentModule + "'.");
            }

            container = getContainerElement(option.container);

            registerComponent(ko, component);

            dataBindValue = "component: { name: \"";
            dataBindValue += component.name instanceof Array ? component.name[0] : component.name;
            dataBindValue += "\"";
            dataBindValue += option.componentParams && JSON ? ", params: " + JSON.stringify(option.componentParams) : "";
            dataBindValue += " }";

            container.setAttribute("data-bind", dataBindValue);
            ko.applyBindings(container);

            if (typeof callback === "function") {
                callback(component);
            }

        });
    }

    function registerComponent(ko, rootComponent) {
        var i;

        if (rootComponent.name instanceof Array) {
            for (i = 0; i < rootComponent.name.length; i++) {
                if (!ko.components.isRegistered(rootComponent.name[i])) {
                    ko.components.register(rootComponent.name[i], rootComponent);
                }
            }
        } else {
            if (!ko.components.isRegistered(rootComponent.name)) {
                ko.components.register(rootComponent.name, rootComponent);
            }
        }

        if (rootComponent.subComponents instanceof Array) {
            for (i = 0; i < rootComponent.subComponents.length; ++i) {
                registerComponent(ko, rootComponent.subComponents[i]);
            }
        }
    }

    function getContainerElement(container) {
        if (typeof container === "string") {
            if (container.substr(0, 1) === "#") {
                return document.getElementById(container.substr(1));
            } else {
                throw new Error("component container must be a element or a string start with '#'.");
            }
        } else {
            return container;
        }
    }

    return exports;

});