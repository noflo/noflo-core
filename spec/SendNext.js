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

describe('SendNext component', function() {
  let c = null;
  let data = null;
  let ins = null;
  let out = null;
  let empty = null;
  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/SendNext', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      data = noflo.internalSocket.createSocket();
      c.inPorts.data.attach(data);
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    empty = noflo.internalSocket.createSocket();
    return c.outPorts.empty.attach(empty);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    out = null;
    c.outPorts.empty.detach(empty);
    return empty = null;
  });

  describe('receiving bang when there is no data', () =>
    it('should send a bang to the empty port', function(done) {
      empty.on('data', d => done());

      ins.send(true);
      return ins.disconnect();
    })
  );

  return describe('receiving two bangs with a grouped data stream', () =>
    it('should send the correct sequence of packets', function(done) {
      let received = [];
      const expected1 = [
        'CONN',
        '< a',
        '< b',
        'DATA 1',
        '>'
      ];
      const expected2 = [
        'DATA 2',
        '>',
        'DISC'
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
      return setTimeout(function() {
        chai.expect(received).to.eql(expected1);
        received = [];

        ins.send(true);
        ins.disconnect();
        return setTimeout(function() {
          chai.expect(received).to.eql(expected2);
          received = [];
          return done();
        }
        , 1);
      }
      , 1);
    })
  );
});
