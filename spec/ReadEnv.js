/* eslint-disable
    consistent-return,
    func-names,
    global-require,
    import/no-unresolved,
    no-return-assign,
    no-shadow,
    no-undef,
    no-unused-vars,
    one-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let baseDir,
  chai;
const noflo = require('noflo');

if (!noflo.isBrowser()) {
  chai = require('chai');
  const path = require('path');
  baseDir = path.resolve(__dirname, '../');
  const window = global;
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
    if (noflo.isBrowser()) { return this.skip(); }
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/ReadEnv', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      key = noflo.internalSocket.createSocket();
      c.inPorts.key.attach(key);
      return done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    err = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    return c.outPorts.error.attach(err);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    return c.outPorts.error.detach(err);
  });

  describe('when instantiated', () => {
    before(function () {
      if (noflo.isBrowser()) { return this.skip(); }
    });
    it('should have input port', () => chai.expect(c.inPorts.key).to.be.an('object'));

    return it('should have an output ports', () => {
      chai.expect(c.outPorts.out).to.be.an('object');
      return chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  describe('reading a nonexistent env var', () => {
    before(function () {
      if (noflo.isBrowser()) { return this.skip(); }
    });
    return it('should return an error', (done) => {
      err.once('data', (data) => {
        chai.expect(data).to.be.an('error');
        return done();
      });
      key.send('baz');
      return key.disconnect();
    });
  });

  return describe('reading a existing env var', () => {
    before(function () {
      if (noflo.isBrowser()) { return this.skip(); }
      return process.env.foo = 'bar';
    });
    return it('should return the value', (done) => {
      out.once('data', (data) => {
        chai.expect(data).to.equal('bar');
        return done();
      });
      key.send('foo');
      return key.disconnect();
    });
  });
});
