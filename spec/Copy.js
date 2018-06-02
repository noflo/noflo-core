/* eslint-disable
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

describe('Copy component', () => {
  let c = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Copy', (err, instance) => {
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

  return describe('when receiving an object', () =>
    it('should send a copy of the object', (done) => {
      const original = {
        hello: 'world',
        list: [1, 2, 3],
      };

      out.on('data', (data) => {
        chai.expect(data).to.eql(original);
        chai.expect(data).to.not.equal(original);
        return done();
      });

      ins.send(original);
      return ins.disconnect();
    }));
});
