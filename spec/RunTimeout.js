/* eslint-disable
    func-names,
    global-require,
    import/no-unresolved,
    no-undef,
    no-unused-vars,
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

describe('RunTimeout component', () => {
  let c = null;
  let start = null;
  let time = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/RunTimeout', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      start = noflo.internalSocket.createSocket();
      c.inPorts.start.attach(start);
      time = noflo.internalSocket.createSocket();
      c.inPorts.time.attach(time);
      return done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(() => c.outPorts.out.detach(out));

  return describe('receiving a time and a bang', () =>
    it('should send a bang out after the timeout', (done) => {
      let started = null;
      out.on('data', (data) => {
        const received = new Date();
        chai.expect(received - started).to.be.at.least(500);
        return done();
      });

      time.send(500);
      started = new Date();
      start.send(null);
      return start.disconnect();
    }));
});
