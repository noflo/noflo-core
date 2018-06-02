/* eslint-disable
    consistent-return,
    func-names,
    global-require,
    import/no-unresolved,
    no-return-assign,
    no-undef,
    one-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let baseDir,
  chai;
const noflo = require('noflo');

if (!noflo.isBrowser()) {
  chai = require('chai');
  const path = require('path');
  baseDir = path.resolve(__dirname, '../');
} else {
  baseDir = 'noflo-core';
}

describe('DisconnectAfterPacket component', () => {
  let c = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/DisconnectAfterPacket', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    return out = null;
  });

  describe('when receiving two packets', () =>
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
        return done();
      });

      ins.send(1);
      ins.send(2);
      return ins.disconnect();
    }));

  return describe('when receiving complex substream of packets', () =>
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
        return done();
      });

      ins.connect();
      ins.beginGroup('a');
      ins.send(1);
      ins.beginGroup('b');
      ins.send(2);
      ins.send(3);
      ins.endGroup();
      ins.endGroup();
      return ins.disconnect();
    }));
});
