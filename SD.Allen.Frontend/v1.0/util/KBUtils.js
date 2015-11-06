(function () {
	"use strict";
	"ver 2015.6.13";

	var exports = {
		isArray: isArray,
		inArray: inArray,
		mapArray: mapArray,
		grepArray: grepArray,
		sortArray: sortArray,
		cloneArray: cloneArray,
		select: mapArray,
		where: grepArray,
		first: first,
		forEach: forEach,
		orderBy: sortArray,
		each: forEach,
		distinctArray: distinctArray,
		sumArray: sumArray,
		groupByArray: groupByArray,
		extendArray: extendArray,
		log: log,
		forEachPromise: forEachPromise,
		convertToISODateString: convertToISODateString,
		isNullOrEmptyString: isNullOrEmptyString,
		getTypeName: getTypeName,
		debounce: debounce,
		newGuid: newGuid,
		trimString: trimString
	};

	function trimString(val) {
		return val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function newGuid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			  .toString(16)
			  .substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		  s4() + '-' + s4() + s4() + s4();
	}

	function debounce(func, delay) {
		var tokenObj = {};
		return function () {
			var token = new Date().getTime().toString();
			tokenObj = {};
			tokenObj[token] = true;
			setTimeout(function() {
				if (tokenObj[token]) {
					func.call();
				}
			}, delay);
		};
	}

	function mapArray(array, mapper) {
		var result = [],
			i;

		for (i = 0; i < array.length; i++) {
			if (typeof mapper === "function") {
				result.push(mapper(array[i], i));
			} else {
				result.push(array[i][mapper]);
			}
		}

		return result;
	}

	function grepArray(array, grepper) {
		var result = [],
			i;

		for (i = 0; i < array.length; i++) {
			if (typeof grepper === "function") {
				if (grepper(array[i], i) === true) {
					result.push(array[i]);
				}
			} else if (typeof grepper === "object") {
				if (doesObjectMatch(array[i], grepper) === true) {
					result.push(array[i]);
				}
			}
		}

		return result;
	}

	function isArray(value) {
		if (typeof Array.isArray === "function") {
			return Array.isArray(value);
		} else {
			return value instanceof Array ||
				(typeof value === "object" &&
				value !== null &&
				typeof value.length === "number" &&
				typeof value.join === "function" &&
				typeof value.push === "function" &&
				typeof value.pop === "function");
		}
	}

	function inArray(array, matcherOrItem) {
		var i;

		for (i = 0; i < array.length; i++) {
			if (typeof matcherOrItem === "function") {
				if (matcherOrItem(array[i], i) === true) {
					return i;
				}
			} else {
				if (array[i] === matcherOrItem) {
					return i;
				}
			}
		}

		return -1;
	}

	function first(array, matcher) {
		var i;

		for (i = 0; i < array.length; i++) {
			if (typeof matcher === "function") {
				if (matcher(array[i], i) === true) {
					return array[i];
				}
			} else if (typeof matcher === "object") {
				if (doesObjectMatch(array[i], matcher) === true) {
					return array[i];
				}
			}
		}

		return null;
	}

	function forEach(data, action) {
		var i, p;

		if (isArray(data)) {
			for (i = 0; i < data.length; i++) {
				action(data[i], i);
			}
		} else {
			for (p in data) {
				if (data.hasOwnProperty(p)) {
					action(p, data[p]);
				}
			}
		}

		return data;
	}

	function sortArray(array, compareFunc) {
		var i, j, temp;

		for (i = 0; i < array.length - 1; ++i) {
			for (j = i + 1; j < array.length; ++j) {
				if (typeof compareFunc === "function") {
					if (compareFunc(array[i], array[j]) > 0) {
						temp = array[i];
						array[i] = array[j];
						array[j] = temp;
					}
				} else {
					if (array[i] > array[j]) {
						temp = array[i];
						array[i] = array[j];
						array[j] = temp;
					}
				}
			}
		}

		return array;
	}

	function cloneArray(array) {
		return array.slice(0);
	}

	function distinctArray(array) {
		var i,
			result = [];

		for (i = 0; i < array.length; ++i) {
			if (inArray(result, array[i]) === -1) {
				result.push(array[i]);
			}
		}

		return result;
	}

	function forEachPromise(arr, asyncAction, success, delay) {
		var currentIndex = 0;

		if (typeof success === "number") {
			delay = success;
		}
		delay = typeof delay === "number" ? delay : 0;

		function finishOne() {
			var promise;

			if (currentIndex < arr.length) {
				promise = asyncAction(arr[currentIndex]);
				++currentIndex;

				if (typeof promise === "object" &&
					typeof promise.then === "function") {
					promise.then(function () {
						setTimeout(finishOne, delay);
					});
				} else {
					setTimeout(finishOne, delay);
				}
			} else {
				if (typeof success === "function") {
					success();
				}
			}
		}

		finishOne();
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

	function convertToISODateString(d) {
		function pad(n) {
			return n < 10 ? '0' + n : n;
		};
		return d.getUTCFullYear() + '-'
			+ pad(d.getUTCMonth() + 1) + '-'
			+ pad(d.getUTCDate()) + 'T'
			+ pad(d.getUTCHours()) + ':'
			+ pad(d.getUTCMinutes()) + ':'
			+ pad(d.getUTCSeconds()) + 'Z';
	}

	function sumArray(arr) {
		var result = 0,
			i;

		for (i = 0; i < arr.length; ++i) {
			if (typeof arr[i] === "number") {
				result += arr[i];
			} else if (typeof arr[i] === "string") {
				if (!Number.isNaN(parseFloat(arr[i]))) {
					result += parseFloat(arr[i]);
				}
			}
		}

		return result;
	}

	function groupByArray(arr, grouper) {
		var result = {},
			key, i;

		for (i = 0; i < arr.length; ++i) {
			if (typeof grouper === "function") {
				key = grouper(arr[i], i);
			} else {
				key = arr[i][grouper];
			}
			if (typeof key !== "undefined" &&
				key !== null) {
				if (typeof result[key] === "undefined") {
					result[key] = [arr[i]];
				} else {
					result[key].push(arr[i]);
				}
			}
		}

		return result;
	}

	function isNullOrEmptyString(val) {
		return typeof val === "undefined" ||
			val === null ||
			(typeof val === "string" && val.length === 0) ||
			(val.toString().length === 0);
	}

	function getTypeName(obj) {
		var funcNameRegex = /function (.{1,})\(/,
			results;

		if (typeof obj === "undefined" || obj === null) {
			return "";
		}

		results = (funcNameRegex).exec(obj.constructor.toString());
		return (results && results.length > 1) ? results[1] : "";
	}

	function extendArray(arr) {
		var result = arr;

		result.where = result.where || function (grepFunc) {
			return grepArray(this, grepFunc);
		};
		result.select = result.select || function (mapFunc) {
			return mapArray(this, mapFunc);
		};
		result.orderBy = result.orderBy || function (compareFunc) {
			return sortArray(this, compareFunc);
		};
		result.distinct = result.distinct || function () {
			return distinctArray(this);
		};
		result.any = result.any || function (item) {
			return inArray(this, item) > -1;
		};
		result.first = result.first || function (matchFunc) {
			return first(this, matchFunc);
		};
		result.forEach = result.forEach || function (action) {
			forEach(this, action);
		};
		result.groupBy = result.groupBy || function (grouper) {
			return groupByArray(this, grouper);
		};
		result.clone = result.clone || function () {
			return cloneArray(this);
		};
		result.groupBy = result.groupBy || function (grouper) {
			return groupByArray(this, grouper);
		};
		return result;
	}

	function doesObjectMatch(obj, matcher) {
		var p;

		for (p in matcher) {
			if (matcher.hasOwnProperty(p)) {
				if (typeof obj[p] === "undefined" ||
					obj[p] !== matcher[p]) {
					return false;
				}
			}
		}

		return true;
	}

	if (typeof define === 'function' && define['amd']) {
		define(function () {
			return exports;
		});
	} else {
		window["$KBUtils"] = exports;
	}

}());
