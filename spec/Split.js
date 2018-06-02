/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let baseDir, chai;
const noflo = require('noflo');

if (!noflo.isBrowser()) {
  chai = require('chai');
  const path = require('path');
  baseDir = path.resolve(__dirname, '../');
} else {
  baseDir = 'noflo-core';
}

describe('Split component', function() {
  let c = null;
  let ins = null;
  let out = null;

  beforeEach(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Split', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      out = noflo.internalSocket.createSocket();
      c.outPorts.out.attach(out);
      return done();
    });
  });

  describe('when instantiated', function() {
    it('should have an input port', () => chai.expect(c.inPorts.in).to.be.an('object'));

    return it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  describe('when sending no packet, only groups', () =>
    it('should forward no packet', function(done) {
      this.timeout(500);
      setTimeout(done, 100);
      ins.beginGroup('foo');
      return ins.endGroup();
    })
  );

  describe('when sending only one packet', function() {
    it('should forward the packet', function(done) {
      out.on('data', function(data) {
        chai.expect(data).to.equal('foo');
        return done();
      });
      return ins.send('foo');
    });
    return it('should forward groups', function(done) {
      const groups = [];
      out.on('begingroup', group => groups.push(group));
      out.on('endgroup', () => groups.pop());
      out.on('data', function(data) {
        chai.expect(data).to.equal('foo');
        chai.expect(groups[0]).to.equal('bar');
        return done();
      });
      ins.beginGroup('bar');
      ins.send('foo');
      return ins.endGroup();
    });
  });

  return describe('when sending many packets', function() {
    it('should forward all packets', function(done) {
      const ids = ['foo', 'bar', 'baz'];
      let packets = [];
      out.on('data', function(data) {
        packets.push(data);
        if (packets.length > 2) {
          chai.expect(packets.length).to.deep.equal(3);
          for (let id of Array.from(ids)) {
            chai.expect(packets).to.include(id);
          }
          packets = [];
          return done();
        }
      });
      return (() => {
        const result = [];
        for (let id of Array.from(ids)) {
          result.push(ins.send(id));
        }
        return result;
      })();
    });
    return it('should forward the right groups', function(done) {
      const ids = ['foo', 'bar', 'baz'];
      let packets = [];
      const groups = [];
      out.on('begingroup', group => groups.push(group));
      out.on('endgroup', () => groups.pop());
      out.on('data', function(data) {
        let packet;
        packets.push({
          data,
          groups: groups.slice(0)
        });
        if (packets.length > 2) {
          chai.expect(packets.length).to.deep.equal(3);
          for (var id of Array.from(ids)) {
            const allData = ((() => {
              const result = [];
              for (packet of Array.from(packets)) {                 result.push(packet.data);
              }
              return result;
            })());
            const idGroups = ((() => {
              const result1 = [];
              for (packet of Array.from(packets)) {                 if (packet.data === id) {
                  result1.push(packet.groups);
                }
              }
              return result1;
            })());
            chai.expect(allData).to.include(id);
            chai.expect(idGroups[0]).to.deep.equal([ `group-of-${id}` ]);
          }
          packets = [];
          return done();
        }
      });
      return (() => {
        const result = [];
        for (let id of Array.from(ids)) {
          ins.beginGroup(`group-of-${id}`);
          ins.send(id);
          result.push(ins.endGroup());
        }
        return result;
      })();
    });
  });
});
