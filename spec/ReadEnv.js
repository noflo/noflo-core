/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let baseDir, chai;
const noflo = require('noflo');
if (!noflo.isBrowser()) {
  chai = require('chai');
  const path = require('path');
  baseDir = path.resolve(__dirname, '../');
  const window = global;
} else {
  baseDir = 'noflo-core';
}

describe('ReadEnv component', function() {
  let c = null;
  let key = null;
  let out = null;
  let err = null;

  before(function(done) {
    this.timeout(4000);
    if (noflo.isBrowser()) { return this.skip(); }
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/ReadEnv', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      key = noflo.internalSocket.createSocket();
      c.inPorts.key.attach(key);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    err = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    return c.outPorts.error.attach(err);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    return c.outPorts.error.detach(err);
  });

  describe('when instantiated', function() {
    before(function() {
      if (noflo.isBrowser()) { return this.skip(); }
    });
    it('should have input port', () => chai.expect(c.inPorts.key).to.be.an('object'));

    return it('should have an output ports', function() {
      chai.expect(c.outPorts.out).to.be.an('object');
      return chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  describe('reading a nonexistent env var', function() {
    before(function() {
      if (noflo.isBrowser()) { return this.skip(); }
    });
    return it('should return an error', function(done) {
      err.once('data', function(data) {
        chai.expect(data).to.be.an('error');
        return done();
      });
      key.send('baz');
      return key.disconnect();
    });
  });

  return describe('reading a existing env var', function() {
    before(function() {
      if (noflo.isBrowser()) { return this.skip(); }
      return process.env.foo = 'bar';
    });
    return it('should return the value', function(done) {
      out.once('data', function(data) {
        chai.expect(data).to.equal('bar');
        return done();
      });
      key.send('foo');
      return key.disconnect();
    });
  });
});
