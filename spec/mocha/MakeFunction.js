describe('MakeFunction component', () => {
  let c = null;
  let ins = null;
  let func = null;
  let out = null;
  let outfunc = null;
  let err = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/MakeFunction', (e, instance) => {
      if (e) {
        done(e);
        return;
      }
      c = instance;
      func = noflo.internalSocket.createSocket();
      c.inPorts.function.attach(func);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    outfunc = noflo.internalSocket.createSocket();
    err = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    c.outPorts.function.attach(outfunc);
    c.outPorts.error.attach(err);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    c.outPorts.function.detach(outfunc);
    c.outPorts.error.detach(err);
  });

  describe('when instantiated', () => {
    it('should have input ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      chai.expect(c.inPorts.function).to.be.an('object');
    });

    it('should have output ports', () => {
      chai.expect(c.outPorts.out).to.be.an('object');
      chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  describe('with only function', () => {
    it('wrong function', (done) => {
      err.on('data', (data) => {
        chai.expect(data).to.be.an('error');
        return done();
      });

      func.send('Foo bar');
    });

    it('output function', (done) => {
      outfunc.on('data', (data) => {
        chai.expect(typeof data).to.equal('function');
        chai.expect(data(2)).to.equal(4);
        done();
      });
      err.on('data', data => done(data));
      func.send('return x*x;');
    });
  });

  describe('with function and input data', () => {
    before(() => {
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
    });
    after(() => {
      c.inPorts.in.detach(ins);
      ins = null;
    });
    it('square function', (done) => {
      out.on('data', (data) => {
        chai.expect(data).to.equal(81);
        done();
      });
      err.on('data', data => done(data));
      func.send('return x*x;');
      ins.send(9);
      ins.disconnect();
    });

    it('concat function', (done) => {
      func.send('return x+x;');
      out.on('data', (data) => {
        chai.expect(data).to.equal('99');
        done();
      });
      err.on('data', data => done(data));
      ins.send('9');
      ins.disconnect();
    });

    it('pass function', (done) => {
      func.send(x => `${x}!`);
      out.on('data', (data) => {
        chai.expect(data).to.equal('hello function!');
        done();
      });
      err.on('data', data => done(data));
      ins.send('hello function');
      ins.disconnect();
    });
  });
});
