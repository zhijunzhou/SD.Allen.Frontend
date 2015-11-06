(function () {
    "use strict";


    /* begin of ComparionOperator */

    /*
        create a ComparisonOperator instance with these ways:
            new ComparisonOperator("Status", "Eq", "Created", "Choice");
            new ComparisonOperator("Title", "Contains", "kaneboy");
            new ComparisonOperator("ID", "In", [1, 3, 5], "Counter");
            new ComparisonOperator("Status", "IsNotNull");
            new ComparisonOperator("<Eq><FieldRef Name='Author' /><Value Type='Integer'><UserID Type='Integer'/></Value></Eq>");
     */
    function ComparisonOperator(field, operatorType, value, valueType) {
        this.operatorType = operatorType;
        this.field = field;
        this.value = value;
        this.valueType = valueType || "Text";

        if (typeof field === "string" &&
            typeof operatorType === "undefined" &&
            typeof value === "undefined") {
            this.camlString = field;
        }
    }

    ComparisonOperator.prototype.toCamlString = function () {
        var result = "", i;

        if (typeof this.camlString === "string") {
            return this.camlString;
        } else {
            if (this.operatorType === "In" && this.value instanceof Array) {
                result = "<" + this.operatorType + ">";
                result += "<FieldRef Name='" + this.field + "' />";
                result += "<Values>";
                for (i = 0; i < this.value.length; i++) {
                    result += "<Value Type='" + this.valueType + "'>" + this.value[i] + "</Value>";
                }
                result += "</Values>";
                result += "</" + this.operatorType + ">";
                return result;
            } else {
                result = "<" + this.operatorType + ">";
                result += "<FieldRef Name='" + this.field + "' />";
                if (this.value) {
                    result += "<Value Type='" + this.valueType + "'>" + this.value + "</Value>";
                }
                result += "</" + this.operatorType + ">";
                return result;
            }
        }
    };

    ComparisonOperator.prototype.toString = ComparisonOperator.prototype.toCamlString;
    ComparisonOperator.prototype.and = andWith;
    ComparisonOperator.prototype.or = orWith;
    ComparisonOperator.prototype.toWhere = wrapWithWhere;

    ComparisonOperator.createCompareWithMeOperator = function (field, operatorType) {
        new ComparisonOperator("<" + operatorType + "><FieldRef Name='" + field + "' /><Value Type='Integer'><UserID Type='Integer'/></Value></" + operatorType + ">");
    };
    /* end of ComparionOperator */



    /* begin of LogicalOperator */
    function LogicalOperator(operator1, logic, operator2) {
        this.logic = logic;
        this.operator1 = operator1;
        this.operator2 = operator2;
    }

    LogicalOperator.prototype.toCamlString = function () {
        return "<" + this.logic + ">" + 
            this.operator1.toCamlString() + 
            this.operator2.toCamlString() + 
            "</" + this.logic + ">";
    };

    LogicalOperator.prototype.toString = LogicalOperator.prototype.toCamlString;
    LogicalOperator.prototype.and = andWith;
    LogicalOperator.prototype.or = orWith;
    LogicalOperator.prototype.toWhere = wrapWithWhere;
    /* end of LogicalOperator */


    /* begin of OrderOperator */
    function OrderOperator(field, desc) {
        this.field = field;
        this.desc = desc === true || (typeof desc === "string" && desc.toLowerCase() === "desc");
    }

    OrderOperator.prototype.toCamlString = function () {
        var ascending = this.desc ? "False" : "True";
        return "<FieldRef Name='" + this.field + "' Ascending='" + ascending + "' />";
    }
    OrderOperator.prototype.toString = OrderOperator.prototype.toCamlString;
    OrderOperator.prototype.toOrderBy = wrapWithOrderBy;
    /* end of LogicalOperator */

    function andWith(operator) {
        return new LogicalOperator(this, "And", operator);
    }

    function orWith(operator) {
        return new LogicalOperator(this, "Or", operator);
    }

    function wrapWithWhere() {
        return "<Where>" + this.toCamlString() + "</Where>";
    }

    function wrapWithOrderBy(operator) {
        return "<OrderBy>" + this.toCamlString() + "</OrderBy>";
    }

    /*
        merge multiple operators with "And"
     */
    function and() {
        var i, j, operator,
            operators = [],
            result = null;

        if (arguments.length === 0) {
            return null;
        }

        for (i = 0; i < arguments.length; i++) {
            if (isArray(arguments[i])) {
                for (j = 0; j < arguments[i].length; j++) {
                    operators.push(arguments[i][j]);
                }
            } else {
                operators.push(arguments[i]);
            }
        }

        result = operators[0];

        for (i = 1; i < operators.length; i++) {
            result = result.and(operators[i]);
        }

        return result;
    }

    /*
        merge multiple operators with "Or"
     */
    function or() {
        var i, j, operator,
            operators = [],
            result = null;

        if (arguments.length === 0) {
            return null;
        }

        for (i = 0; i < arguments.length; i++) {
            if (isArray(arguments[i])) {
                for (j = 0; j < arguments[i].length; j++) {
                    operators.push(arguments[i][j]);
                }
            } else {
                operators.push(arguments[i]);
            }
        }

        result = operators[0];

        for (i = 1; i < operators.length; i++) {
            result = result.or(operators[i]);
        }

        return result;
    }

    function buildInclude() {

        var allFields = [];
        allFields.fieldsDict = {};

        function addField(field) {
            if (field) {
                field = field.toString();
                if (!allFields.fieldsDict[field]) {
                    allFields.push(field);
                    allFields.fieldsDict[field] = field;
                }
            }
        }

        function addFields(fields) {
            for (var i = 0; i < fields.length; i++) {
                addField(fields[i]);
            }
        }

        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (jq.isArray(arg)) {
                addFields(arg);
            } else {
                addField(arg);
            }
        }

        return "Include(" + allFields.join(", ") + ")";
    }

    function isArray(value) {
        return value instanceof Array || 
            (typeof value === "object" &&
            value !== null &&
            typeof value.length === "number" &&
            typeof value.join === "function" &&
            typeof value.push === "function" &&
            typeof value.pop === "function");
    }

 

    var exports = {
        ComparisonOperator: ComparisonOperator,
        LogicalOperator: LogicalOperator,
        OrderOperator: OrderOperator,
        and: and,
        or: or,
        buildInclude: buildInclude
    };

    if (typeof define === 'function' && define['amd']) {
        define(function () {
            return exports;
        });
    } else {
        window["$SPCamlBuilder"] = exports;
    }

}());