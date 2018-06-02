/* global describe it before beforeEach afterEach */
const noflo = require('noflo');
const path = require('path');
const chai = require('chai');

let baseDir;

if (!noflo.isBrowser()) {
  baseDir = path.resolve(__dirname, '../');
} else {
  baseDir = 'noflo-core';
}

describe('ReadEnv component', () => {
  let c = null;
  let key = null;
  let out = null;
  let err = null;

  before(function (done) {
    this.timeout(4000);
    if (noflo.isBrowser()) {
      this.skip();
      return;
    }
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/ReadEnv', (e, instance) => {
      if (e) {
        done(err);
        return;
      }
      c = instance;
      key = noflo.internalSocket.createSocket();
      c.inPorts.key.attach(key);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    err = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    c.outPorts.error.attach(err);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    c.outPorts.error.detach(err);
  });

  describe('when instantiated', () => {
    before(() => {
      if (noflo.isBrowser()) {
        this.skip();
      }
    });
    it('should have input port', () => {
      chai.expect(c.inPorts.key).to.be.an('object');
    });

    it('should have an output ports', () => {
      chai.expect(c.outPorts.out).to.be.an('object');
      chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  describe('reading a nonexistent env var', () => {
    before(() => {
      if (noflo.isBrowser()) {
        this.skip();
      }
    });
    it('should return an error', (done) => {
      err.once('data', (data) => {
        chai.expect(data).to.be.an('error');
        done();
      });
      key.send('baz');
      key.disconnect();
    });
  });

  describe('reading a existing env var', () => {
    before(() => {
      if (noflo.isBrowser()) {
        this.skip();
        return;
      }
      process.env.foo = 'bar';
    });
    it('should return the value', (done) => {
      out.once('data', (data) => {
        chai.expect(data).to.equal('bar');
        done();
      });
      key.send('foo');
      key.disconnect();
    });
  });
});
