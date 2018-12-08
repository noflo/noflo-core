describe('Callback component', () => {
  let c = null;
  let ins = null;
  let cb = null;
  let err = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/Callback', (e, instance) => {
      if (e) {
        done(e);
        return;
      }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      cb = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      c.inPorts.callback.attach(cb);
      done();
    });
  });
  beforeEach(() => {
    err = noflo.internalSocket.createSocket();
    c.outPorts.error.attach(err);
  });
  afterEach(() => {
    c.outPorts.error.detach(err);
    err = null;
  });

  describe('when instantiated', () => {
    it('should have input ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      chai.expect(c.inPorts.callback).to.be.an('object');
    });

    it('should have an output port', () => chai.expect(c.outPorts.error).to.be.an('object'));
  });

  describe('test callback', () => {
    it('wrong callback', (done) => {
      err.on('data', (data) => {
        chai.expect(data).to.be.an('error');
        done();
      });

      cb.send('Foo bar');
      ins.connect();
      ins.send('Hello');
      return ins.disconnect();
    });

    it('right callback', (done) => {
      const callback = (data) => {
        chai.expect(data).to.equal('hello, world');
        done();
      };
      cb.send(callback);

      ins.connect();
      ins.send('hello, world');
      ins.disconnect();
    });
  });
});
