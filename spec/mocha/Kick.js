describe('Kick component', () => {
  let c = null;
  let ins = null;
  let data = null;
  let out = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/Kick', (err, instance) => {
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
  beforeEach((done) => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    c.start(done);
  });
  afterEach((done) => {
    c.outPorts.out.detach(out);
    out = null;
    c.shutdown(done);
  });

  describe('when instantiated', () => {
    it('should have input ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      chai.expect(c.inPorts.data).to.be.an('object');
    });

    it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  describe('without full stream', () => {
    it('should not send anything', (done) => {
      let sent = false;
      out.on('data', () => {
        sent = true;
      });

      ins.beginGroup('bar');
      ins.send('foo');
      setTimeout(() => {
        chai.expect(sent, 'Should not have sent data').to.equal(false);
        c.shutdown((err) => {
          if (err) {
            done(err);
            return;
          }
          c.start(done);
        });
      }, 5);
    });
  });

  describe('without specified data', () => {
    it('it should send a NULL', (done) => {
      out.on('data', (d) => {
        chai.expect(d).to.be.a('null');
        done();
      });

      ins.connect();
      ins.send('foo');
      ins.disconnect();
    });
  });

  return describe('with data', () => {
    before(() => {
      data = noflo.internalSocket.createSocket();
      c.inPorts.data.attach(data);
    });
    after(() => {
      c.inPorts.data.detach(data);
      data = null;
    });
    it('should send the supplied data', (done) => {
      out.once('data', (d) => {
        chai.expect(d).to.be.an('object');
        chai.expect(d.foo).to.equal('bar');
        done();
      });

      data.send({ foo: 'bar' });
      ins.send('foo');
      ins.disconnect();
    });

    it('should send data on a kick IP', (done) => {
      out.once('data', (d) => {
        chai.expect(d).to.be.an('object');
        chai.expect(d.foo).to.be.equal('bar');
        done();
      });

      data.send({ foo: 'bar' });
      ins.post(new noflo.IP('data', 'foo'));
    });

    it('should send data on a kick stream', (done) => {
      const expected = [
        'CONN',
        '< foo',
        '< bar',
        'DATA {"foo":"bar"}',
        '>',
        '>',
        'DISC',
      ];
      const received = [];
      out.on('connect', () => received.push('CONN'));
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', d => received.push(`DATA ${JSON.stringify(d)}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', () => {
        received.push('DISC');
        chai.expect(received).to.eql(expected);
        done();
      });

      data.send({ foo: 'bar' });
      ['foo', 'bar'].forEach(grp => ins.beginGroup(grp));
      ins.send('foo');
      ['foo', 'bar'].forEach(() => ins.endGroup());
      ins.disconnect();
    });
  });
});
