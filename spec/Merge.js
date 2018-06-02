/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
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

describe('Merge component', function() {
  let c = null;
  let ins1 = null;
  let ins2 = null;
  let out = null;
  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Merge', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      ins1 = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins1);
      ins2 = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins2);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    return out = null;
  });

  return describe('when receiving packets from multiple inputs', () =>
    it('should send them as a single stream', function(done) {
      const expected = [
        'CONN',
        '< a',
        'DATA 1',
        '>',
        'DISC',
        'CONN',
        '< b',
        'DATA 2',
        '>',
        'DISC'
      ];
      const received = [];
      out.on('connect', () => received.push('CONN'));
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', data => received.push(`DATA ${data}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', function() {
        received.push('DISC');
        if (received.length !== expected.length) { return; }
        chai.expect(received).to.eql(expected);
        return done();
      });

      ins1.beginGroup('a');
      ins1.send(1);
      ins1.endGroup();
      ins1.disconnect();

      ins2.beginGroup('b');
      ins2.send(2);
      ins2.endGroup();
      return ins2.disconnect();
    })
  );
});
