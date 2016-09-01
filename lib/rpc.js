'use strict';

var utils = require('./utils');

exports.register = function(proc, name, func) {
	init(proc);

	if (proc._rpc.funcs[name]) {
		throw new Error('function `' + name + '` already registered');
	}

	proc._rpc.funcs[name] = func;
};

exports.call = function(proc, name, args, callback) {
	init(proc);

	if (utils.isFunction(args)) {
		callback = args;
		args = [];
	}

	if (!utils.isArray(args)) {
		args = [args];
	}

	var id = utils.uid();

	proc._rpc.results[id] = callback;

	proc.send({
		type: 'rpc-call',
		id: id,
		name: name,
		args: args
	});
};

function init(proc) {
	if (proc.hasOwnProperty('_rpc')) {
		return;
	}

	Object.defineProperty(proc, '_rpc', {
		configurable: false,
		enumerable: false,
		writable: false,
		value: {
			funcs: {},
			results: {}
		}
	});

	proc.on('message', function(message) {
		/* istanbul ignore else */
		if (message.type === 'rpc-call') {
			if (!proc._rpc.funcs[message.name]) {
				return proc.send({
					type: 'rpc-result',
					id: message.id,
					err: utils.serializeError(
						new Error('unknown function `' + message.name + '`')
					)
				});
			}

			var args = message.args.concat(function(err, result) {
				proc.send({
					type: 'rpc-result',
					id: message.id,
					err: utils.serializeError(err),
					result: result
				});
			});

			proc._rpc.funcs[message.name].apply(null, args);
		} else if (message.type === 'rpc-result' && proc._rpc.results[message.id]) {
			proc._rpc.results[message.id](message.err, message.result);
			delete proc._rpc.results[message.id];
		}
	});
}
