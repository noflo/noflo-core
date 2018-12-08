describe('Drop component', () => {
  let c = null;
  let ins = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/Drop', (err, instance) => {
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

  describe('when receiving a packet', () => {
    it('should drop it', (done) => {
      const ip = new noflo.IP('data', 'Foo');
      setTimeout(
        () => {
          chai.expect(Object.keys(ip)).to.eql([]);
          return done();
        },
        200,
      );
      ins.connect();
      ins.send(ip);
      ins.disconnect();
    });
  });
});
