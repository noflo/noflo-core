describe('SendNext component', () => {
  let c = null;
  let data = null;
  let ins = null;
  let out = null;
  let empty = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/SendNext', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      data = noflo.internalSocket.createSocket();
      c.inPorts.data.attach(data);
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    empty = noflo.internalSocket.createSocket();
    c.outPorts.empty.attach(empty);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    out = null;
    c.outPorts.empty.detach(empty);
    empty = null;
  });

  describe('receiving bang when there is no data', () => {
    it('should send a bang to the empty port', (done) => {
      empty.on('data', () => done());

      ins.send(true);
      ins.disconnect();
    });
  });

  describe('receiving two bangs with a grouped data stream', () => {
    it('should send the correct sequence of packets', (done) => {
      let received = [];
      const expected1 = [
        'CONN',
        '< a',
        '< b',
        'DATA 1',
        '>',
      ];
      const expected2 = [
        'DATA 2',
        '>',
        'DISC',
      ];

      out.on('connect', () => received.push('CONN'));
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', d => received.push(`DATA ${d}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', () => received.push('DISC'));

      data.beginGroup('a');
      data.beginGroup('b');
      data.send(1);
      data.endGroup();
      data.send(2);
      data.endGroup();
      data.disconnect();

      ins.send(true);
      ins.disconnect();
      setTimeout(() => {
        chai.expect(received).to.eql(expected1);
        received = [];

        ins.send(true);
        ins.disconnect();
        setTimeout(() => {
          chai.expect(received).to.eql(expected2);
          received = [];
          done();
        }, 1);
      }, 1);
    });
  });
});
