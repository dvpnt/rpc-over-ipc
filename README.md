# rpc-over-ipc
[![Build Status](https://api.travis-ci.org/dvpnt/rpc-over-ipc.svg)](https://travis-ci.org/dvpnt/rpc-over-ipc)
[![Coverage Status](https://coveralls.io/repos/github/dvpnt/rpc-over-ipc/badge.svg?branch=master)](https://coveralls.io/github/dvpnt/rpc-over-ipc?branch=master)
[![NPM Version](https://img.shields.io/npm/v/rpc-over-ipc.svg)](https://www.npmjs.com/package/rpc-over-ipc)

Lightweight RPC over IPC for node.js

## Install
```bash
$ npm i rpc-over-ipc
```

## API

### `register(proc, name, func)`
* `proc` - `ChildProcess` instance or `process`
* `name` - function name
* `func` - asynchronous function to call, last argument should be a callback function that takes `err` and `result` arguments

#### Example
```js
	var rpc = require('rpc-over-ipc');
	rpc.register(process, 'add', function(a, b, callback) {
		callback(null, a + b);
	});
```

### `call(proc, name, [args], callback)`
* `proc` - `ChildProcess` instance or `process`
* `name` - function name
* `args` - array the arguments with which `name` function should be called, optional
* `callback` - callback function which is called when `name` functions have finished

#### Example
```js
	var rpc = require('rpc-over-ipc');
	rpc.call(process, 'add', [1, 2], function(err, result) {
		console.log(result);
	});
```
## License

[The MIT License](https://raw.githubusercontent.com/dvpnt/rpc-over-ipc/master/LICENSE)
