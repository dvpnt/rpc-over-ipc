'use strict';

var crypto = require('crypto');

var toString = Object.prototype.toString;

exports.isFunction = function(obj) {
	return toString.call(obj) === '[object Function]';
};

exports.isArray = function(arr) {
	return Array.isArray(arr);
};

exports.uid = function() {
	return crypto.pseudoRandomBytes(16).toString('hex');
};

exports.serializeError = function(err) {
	if (err instanceof Error) {
		return Object.getOwnPropertyNames(err).reduce(function(result, key) {
			result[key] = err[key];
			return result;
		}, {});
	} else {
		return err;
	}
};
