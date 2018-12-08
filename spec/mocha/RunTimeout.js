describe('RunTimeout component', () => {
  let c = null;
  let start = null;
  let time = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/RunTimeout', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      start = noflo.internalSocket.createSocket();
      c.inPorts.start.attach(start);
      time = noflo.internalSocket.createSocket();
      c.inPorts.time.attach(time);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
  });

  describe('receiving a time and a bang', () => {
    it('should send a bang out after the timeout', (done) => {
      let started = null;
      out.on('data', () => {
        const received = new Date();
        chai.expect(received - started).to.be.at.least(500);
        done();
      });

      time.send(500);
      started = new Date();
      start.send(null);
      start.disconnect();
    });
  });
});
