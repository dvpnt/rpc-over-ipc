'use strict';

var rpc = require('../'),
	testUtils = require('./utils.js');

rpc.register(process, 'add', testUtils.add);
rpc.register(process, 'error', testUtils.error);

// stay alive
require('http').createServer().listen();
