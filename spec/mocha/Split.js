describe('Split component', () => {
  let c = null;
  let ins = null;
  let out = null;

  beforeEach(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/Split', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      out = noflo.internalSocket.createSocket();
      c.outPorts.out.attach(out);
      done();
    });
  });

  describe('when instantiated', () => {
    it('should have an input port', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
    });

    it('should have an output port', () => {
      chai.expect(c.outPorts.out).to.be.an('object');
    });
  });

  describe('when sending no packet, only groups', () => {
    it('should forward no packet', function (done) {
      this.timeout(500);
      setTimeout(done, 100);
      ins.beginGroup('foo');
      ins.endGroup();
    });
  });

  describe('when sending only one packet', () => {
    it('should forward the packet', (done) => {
      out.on('data', (data) => {
        chai.expect(data).to.equal('foo');
        done();
      });
      ins.send('foo');
    });
    it('should forward groups', (done) => {
      const groups = [];
      out.on('begingroup', group => groups.push(group));
      out.on('endgroup', () => groups.pop());
      out.on('data', (data) => {
        chai.expect(data).to.equal('foo');
        chai.expect(groups[0]).to.equal('bar');
        done();
      });
      ins.beginGroup('bar');
      ins.send('foo');
      ins.endGroup();
    });
  });

  describe('when sending many packets', () => {
    it('should forward all packets', (done) => {
      const ids = ['foo', 'bar', 'baz'];
      let packets = [];
      out.on('data', (data) => {
        packets.push(data);
        if (packets.length > 2) {
          chai.expect(packets.length).to.deep.equal(3);
          ids.forEach((id) => {
            chai.expect(packets).to.include(id);
          });
          packets = [];
          done();
        }
      });
      ids.forEach((id) => {
        ins.send(id);
      });
    });
    it('should forward the right groups', (done) => {
      const ids = ['foo', 'bar', 'baz'];
      let packets = [];
      const groups = [];
      out.on('begingroup', group => groups.push(group));
      out.on('endgroup', () => groups.pop());
      out.on('data', (data) => {
        packets.push({
          data,
          groups: groups.slice(0),
        });
        if (packets.length > 2) {
          chai.expect(packets.length).to.deep.equal(3);
          ids.forEach((id) => {
            const allData = packets.map(p => p.data);
            const idGroups = packets
              .filter(p => p.data === id)
              .map(p => p.groups);
            chai.expect(allData).to.include(id);
            chai.expect(idGroups[0]).to.deep.equal([`group-of-${id}`]);
          });
          packets = [];
          done();
        }
      });
      ids.forEach((id) => {
        ins.beginGroup(`group-of-${id}`);
        ins.send(id);
        ins.endGroup();
      });
    });
  });
});
