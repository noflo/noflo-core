describe('DisconnectAfterPacket component', () => {
  let c = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/DisconnectAfterPacket', (err, instance) => {
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

  describe('when receiving two packets', () => {
    it('should send a disconnect', (done) => {
      const expected = [
        'DATA 1',
        'DISC',
        'DATA 2',
        'DISC',
      ];
      const received = [];
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', data => received.push(`DATA ${data}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', () => {
        received.push('DISC');
        if (received.length !== expected.length) { return; }
        chai.expect(received).to.eql(expected);
        done();
      });

      ins.send(1);
      ins.send(2);
      ins.disconnect();
    });
  });

  describe('when receiving complex substream of packets', () => {
    it('should send a disconnect for each', (done) => {
      const expected = [
        'CONN',
        '< a',
        'DATA 1',
        '>',
        'DISC',
        'CONN',
        '< a',
        '< b',
        'DATA 2',
        '>',
        '>',
        'DISC',
        'CONN',
        '< a',
        '< b',
        'DATA 3',
        '>',
        '>',
        'DISC',
      ];
      const received = [];
      out.on('connect', () => received.push('CONN'));
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', data => received.push(`DATA ${data}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', () => {
        received.push('DISC');
        if (received.length !== expected.length) { return; }
        chai.expect(received).to.eql(expected);
        done();
      });

      ins.connect();
      ins.beginGroup('a');
      ins.send(1);
      ins.beginGroup('b');
      ins.send(2);
      ins.send(3);
      ins.endGroup();
      ins.endGroup();
      ins.disconnect();
    });
  });
});
