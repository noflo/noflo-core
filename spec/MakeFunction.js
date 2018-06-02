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

describe('MakeFunction component', function() {
  let c = null;
  let ins = null;
  let func = null;
  let out = null;
  let outfunc = null;
  let err = null;

  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/MakeFunction', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      func = noflo.internalSocket.createSocket();
      c.inPorts.function.attach(func);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    outfunc = noflo.internalSocket.createSocket();
    err = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    c.outPorts.function.attach(outfunc);
    return c.outPorts.error.attach(err);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    c.outPorts.function.detach(outfunc);
    return c.outPorts.error.detach(err);
  });

  describe('when instantiated', function() {
    it('should have input ports', function() {
      chai.expect(c.inPorts.in).to.be.an('object');
      return chai.expect(c.inPorts.function).to.be.an('object');
    });

    return it('should have output ports', function() {
      chai.expect(c.outPorts.out).to.be.an('object');
      return chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  describe('with only function', function() {
    it('wrong function', function(done) {
      err.on('data', function(data) {
        chai.expect(data).to.be.ok;
        return done();
      });

      return func.send('Foo bar');
    });

    return it('output function', function(done) {
      outfunc.on('data', function(data) {
        chai.expect(typeof data).to.equal("function");
        chai.expect(data(2)).to.equal(4);
        return done();
      });
      err.on('data', data => done(data));
      return func.send('return x*x;');
    });
  });

  return describe('with function and input data', function() {
    before(function() {
      ins = noflo.internalSocket.createSocket();
      return c.inPorts.in.attach(ins);
    });
    after(function() {
      c.inPorts.in.detach(ins);
      return ins = null;
    });
    it('square function', function(done) {
      out.on('data', function(data) {
        chai.expect(data).to.equal(81);
        return done();
      });
      err.on('data', data => done(data));
      func.send('return x*x;');
      ins.send(9);
      return ins.disconnect();
    });

    it('concat function', function(done) {
      func.send('return x+x;');
      out.on('data', function(data) {
        chai.expect(data).to.equal("99");
        return done();
      });
      err.on('data', data => done(data));
      ins.send("9");
      return ins.disconnect();
    });

    return it('pass function', function(done) {
      func.send( x => x+"!");
      out.on('data', function(data) {
        chai.expect(data).to.equal("hello function!");
        return done();
      });
      err.on('data', data => done(data));
      ins.send("hello function");
      return ins.disconnect();
    });
  });
});
