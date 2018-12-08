describe('RunInterval component', () => {
  let c = null;
  let interval = null;
  let start = null;
  let stop = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/RunInterval', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      interval = noflo.internalSocket.createSocket();
      c.inPorts.interval.attach(interval);
      start = noflo.internalSocket.createSocket();
      c.inPorts.start.attach(start);
      stop = noflo.internalSocket.createSocket();
      c.inPorts.stop.attach(stop);
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

  describe('running an interval', () => {
    it('should send packets', function (done) {
      this.timeout(6000);
      let received = 0;
      out.on('data', () => {
        received += 1;
      });

      setTimeout(() => {
        chai.expect(received).to.be.at.least(4);
        done();
      }, 2001);

      interval.send(400);
      start.send(true);
      start.disconnect();
    });
    it('should stop after being told to', function (done) {
      this.timeout(6000);
      let received = 0;
      stop.send(true);
      stop.disconnect();
      out.on('data', () => {
        received += 1;
      });

      setTimeout(() => {
        chai.expect(received).to.be.below(2);
        done();
      }, 1000);

      interval.send(500);
      start.send(true);
      start.disconnect();
    });
  });
});
