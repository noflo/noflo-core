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
} else {
  baseDir = 'noflo-core';
}

describe('Callback component', function() {
  let c = null;
  let ins = null;
  let cb = null;
  let err = null;

  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Callback', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      cb = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      c.inPorts.callback.attach(cb);
      return done();
    });
  });
  beforeEach(function() {
    err = noflo.internalSocket.createSocket();
    return c.outPorts.error.attach(err);
  });
  afterEach(function() {
    c.outPorts.error.detach(err);
    return err = null;
  });

  describe('when instantiated', function() {
    it('should have input ports', function() {
      chai.expect(c.inPorts.in).to.be.an('object');
      return chai.expect(c.inPorts.callback).to.be.an('object');
    });

    return it('should have an output port', () => chai.expect(c.outPorts.error).to.be.an('object'));
  });

  return describe('test callback', function() {
    it('wrong callback', function(done) {
      err.on('data', function(data) {
        chai.expect(data).to.be.an('error');
        return done();
      });

      cb.send('Foo bar');
      ins.connect();
      ins.send('Hello');
      return ins.disconnect();
    });

    return it('right callback', function(done) {
      const callback = function(data) {
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
