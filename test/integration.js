'use strict';

var rpc = require('../'),
	expect = require('expect.js'),
	spawn = require('child_process').spawn,
	path = require('path');

describe('integration', function() {
	var child;

	before(function() {
		child = spawn('node', [path.resolve(__dirname, './child.js')], {
			stdio: ['pipe', 'pipe', 'pipe', 'ipc']
		});
	});

	it('success call', function(done) {
		rpc.call(child, 'add', [1, 2], function(err, result) {
			expect(err).not.ok();
			expect(result).to.eql(3);
			done();
		});
	});

	it('error call', function(done) {
		rpc.call(child, 'error', function(err) {
			expect(err).to.be.ok();
			expect(err.message).to.eql('error');
			done();
		});
	});

	after(function() {
		process.kill(child.pid, 'SIGKILL');
	});
});
