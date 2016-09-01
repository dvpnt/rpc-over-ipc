'use strict';

var EventEmitter = require('events'),
	inherits = require('util').inherits;

var MockProcess = function() {};
inherits(MockProcess, EventEmitter);

MockProcess.prototype.send = function() {};

exports.MockProcess = MockProcess;

exports.getMocks = function() {
	var proc = new MockProcess(),
		child = new MockProcess();

	proc.send = function(message) {
		child.emit('message', message);
	};

	child.send = function(message) {
		proc.emit('message', message);
	};

	return {
		proc: proc,
		child: child
	};
};

exports.add = function(a, b, callback) {
	process.nextTick(function() {
		callback(null, a + b);
	});
};

exports.mul = function(a, b, callback) {
	process.nextTick(function() {
		callback(null, a * b);
	});
};

exports.ten = function(callback) {
	process.nextTick(function() {
		callback(null, 10);
	});
};

exports.identity = function(a, callback) {
	process.nextTick(function() {
		callback(null, a);
	});
};

exports.error = function(callback) {
	process.nextTick(function() {
		callback(new Error('error'));
	});
};
