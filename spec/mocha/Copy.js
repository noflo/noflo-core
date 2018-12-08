describe('Copy component', () => {
  let c = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/Copy', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    out = null;
  });

  describe('when receiving an object', () => {
    it('should send a copy of the object', (done) => {
      const original = {
        hello: 'world',
        list: [1, 2, 3],
      };

      out.on('data', (data) => {
        chai.expect(data).to.eql(original);
        chai.expect(data).to.not.equal(original);
        done();
      });

      ins.send(original);
      ins.disconnect();
    });
  });
});
