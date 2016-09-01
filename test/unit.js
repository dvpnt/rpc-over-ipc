'use strict';

var rpc = require('../'),
	utils = require('../lib/utils'),
	Steppy = require('twostep').Steppy,
	expect = require('expect.js'),
	testUtils = require('./utils.js');

describe('unit', function() {
	describe('utils', function() {
		describe('serializeError', function() {
			var serializeError = utils.serializeError;

			it('non-error objects', function() {
				[
					null,
					undefined,
					0,
					1337,
					'foo',
					{foo: 'bar'}
				].forEach(function(value) {
					expect(serializeError(value)).to.equal(value);
				});
			});

			it('error objects', function() {
				[
					new Error('error'),
					new TypeError('error'),
					new RangeError('error')
				].forEach(function(value) {
					var result = serializeError(value);
					expect(result).to.be.an('object');
					expect(result.message).to.eql('error');
					expect(result).to.have.property('stack');
					expect(result.stack).to.contain('unit.js');
				});
			});
		});
	});

	describe('register', function() {
		var mocks = testUtils.getMocks();

		it('first call', function() {
			rpc.register(mocks.proc, 'add', testUtils.add);
			expect(mocks.proc).to.have.property('_rpc');
			expect(mocks.proc._rpc).to.be.an('object');
			expect(mocks.proc._rpc.funcs.add).to.be.an('function');
		});

		it('second call', function() {
			rpc.register(mocks.proc, 'mul', testUtils.mul);
			expect(mocks.proc._rpc.funcs).to.have.property('mul');
			expect(mocks.proc._rpc.funcs.mul).to.be.an('function');
		});

		it('with same name', function() {
			expect(function() {
				rpc.register(mocks.proc, 'add', testUtils.add);
			}).to.throwError('function `add` already registered');
		});
	});

	describe('call', function() {
		var mocks = testUtils.getMocks();

		before(function() {
			[mocks.proc, mocks.child].forEach(function(proc) {
				rpc.register(proc, 'add', testUtils.add);
				rpc.register(proc, 'mul', testUtils.mul);
				rpc.register(proc, 'ten', testUtils.ten);
				rpc.register(proc, 'identity', testUtils.identity);
				rpc.register(proc, 'error', testUtils.error);
			});
		});

		it('first call', function() {
			var proc = new testUtils.MockProcess();
			rpc.call(proc, 'noop', function() {});
			expect(proc).to.have.property('_rpc');
			expect(proc._rpc).to.be.an('object');
		});

		it('unregistered function', function(done) {
			rpc.call(mocks.child, 'noop', function(err) {
				expect(err.message).to.eql('unknown function `noop`');
				done();
			});
		});

		it('error function', function(done) {
			rpc.call(mocks.child, 'error', function(err) {
				expect(err.message).to.eql('error');
				done();
			});
		});

		it('without args', function(done) {
			rpc.call(mocks.child, 'ten', function(err, result) {
				expect(err).not.be.ok();
				expect(result).to.eql(10);
				done();
			});
		});

		it('with one arg', function(done) {
			rpc.call(mocks.child, 'identity', 'foo', function(err, result) {
				expect(err).not.be.ok();
				expect(result).to.eql('foo');
				done();
			});
		});

		it('with args', function(done) {
			rpc.call(mocks.child, 'add', [1, 2], function(err, result) {
				expect(err).not.be.ok();
				expect(result).to.eql(3);
				done();
			});
		});

		it('one function in parallel', function(done) {
			Steppy(
				function() {
					rpc.call(mocks.child, 'add', [1, 2], this.slot());
					rpc.call(mocks.child, 'add', [2, 3], this.slot());
					rpc.call(mocks.child, 'add', [4, 5], this.slot());
				},
				function(err, result0, result1, result2) {
					expect(result0).to.eql(3);
					expect(result1).to.eql(5);
					expect(result2).to.eql(9);
					this.pass(null);
				},
				done
			);
		});

		it('different functions in parallel', function(done) {
			Steppy(
				function() {
					rpc.call(mocks.child, 'add', [1, 2], this.slot());
					rpc.call(mocks.child, 'mul', [2, 3], this.slot());
					rpc.call(mocks.child, 'identity', 'bar', this.slot());
				},
				function(err, result0, result1, result2) {
					expect(result0).to.eql(3);
					expect(result1).to.eql(6);
					expect(result2).to.eql('bar');
					this.pass(null);
				},
				done
			);
		});

		it('in both ways', function(done) {
			Steppy(
				function() {
					rpc.call(mocks.child, 'add', [1, 2], this.slot());
					rpc.call(mocks.proc, 'add', [2, 3], this.slot());
				},
				function(err, result0, result1) {
					expect(result0).to.eql(3);
					expect(result1).to.eql(5);
					this.pass(null);
				},
				done
			);
		});

		it('many parallel functions', function(done) {
			Steppy(
				function() {
					var group = this.makeGroup();
					for (var i = 0; i < 1000; i++) {
						rpc.call(mocks.child, 'identity', i, group.slot());
					}
				},
				function(err, results) {
					var expected = [];
					for (var i = 0; i < 1000; i++) {
						expected.push(i);
					}
					expect(results).to.eql(expected);
					this.pass(null);
				},
				done
			);
		});
	});
});
