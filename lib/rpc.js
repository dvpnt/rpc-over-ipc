'use strict';

var utils = require('./utils');

exports.register = function(proc, name, func) {
	if (!proc.hasOwnProperty('$rpc')) {
		Object.defineProperty(proc, '$rpc', {
			configurable: false,
			enumerable: false,
			writable: false,
			value: {}
		});

		proc.on('message', function(message) {
			if (message.type !== 'rpc-call') {
				return;
			}

			if (!proc.$rpc[message.name]) {
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

			proc.$rpc[message.name].apply(null, args);
		});
	}

	if (proc.$rpc[name]) {
		throw new Error('function `' + name + '` already registered');
	}

	proc.$rpc[name] = func;
};

exports.call = function(proc, name, args, callback) {
	if (utils.isFunction(args)) {
		callback = args;
		args = [];
	}

	if (!utils.isArray(args)) {
		args = [args];
	}

	var id = utils.uid();

	var listener = function(message) {
		if (message.type === 'rpc-result' && message.id === id) {
			proc.removeListener('message', listener);
			callback(message.err, message.result);
		}
	};

	proc.setMaxListeners(0);

	proc.on('message', listener);

	proc.send({
		type: 'rpc-call',
		id: id,
		name: name,
		args: args
	});
};
