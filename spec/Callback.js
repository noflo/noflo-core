/* eslint-disable
    func-names,
    global-require,
    import/no-unresolved,
    no-return-assign,
    no-shadow,
    no-undef,
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
} else {
  baseDir = 'noflo-core';
}

describe('Callback component', () => {
  let c = null;
  let ins = null;
  let cb = null;
  let err = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Callback', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      cb = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      c.inPorts.callback.attach(cb);
      return done();
    });
  });
  beforeEach(() => {
    err = noflo.internalSocket.createSocket();
    return c.outPorts.error.attach(err);
  });
  afterEach(() => {
    c.outPorts.error.detach(err);
    return err = null;
  });

  describe('when instantiated', () => {
    it('should have input ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      return chai.expect(c.inPorts.callback).to.be.an('object');
    });

    return it('should have an output port', () => chai.expect(c.outPorts.error).to.be.an('object'));
  });

  return describe('test callback', () => {
    it('wrong callback', (done) => {
      err.on('data', (data) => {
        chai.expect(data).to.be.an('error');
        return done();
      });

      cb.send('Foo bar');
      ins.connect();
      ins.send('Hello');
      return ins.disconnect();
    });

    return it('right callback', (done) => {
      const callback = function (data) {
        chai.expect(data).to.equal('hello, world');
        return done();
      };
      cb.send(callback);

      ins.connect();
      ins.send('hello, world');
      return ins.disconnect();
    });
  });
});
