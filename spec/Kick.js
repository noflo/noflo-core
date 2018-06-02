/* eslint-disable
    block-scoped-var,
    func-names,
    global-require,
    import/no-unresolved,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    no-var,
    one-var,
    vars-on-top,
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

describe('Kick component', () => {
  let c = null;
  let ins = null;
  let data = null;
  let out = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/Kick', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach((done) => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    return c.start(done);
  });
  afterEach((done) => {
    c.outPorts.out.detach(out);
    out = null;
    return c.shutdown(done);
  });

  describe('when instantiated', () => {
    it('should have input ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      return chai.expect(c.inPorts.data).to.be.an('object');
    });

    return it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  describe('without full stream', () =>
    it('should not send anything', (done) => {
      let sent = false;
      out.on('data', data => sent = true);

      ins.beginGroup('bar');
      ins.send('foo');
      return setTimeout(
        () => {
          chai.expect(sent, 'Should not have sent data').to.be.false;
          return c.shutdown((err) => {
            if (err) { return done(err); }
            return c.start(done);
          });
        }
        , 5,
      );
    }));

  describe('without specified data', () =>
    it('it should send a NULL', (done) => {
      out.on('data', (data) => {
        chai.expect(data).to.be.null;
        return done();
      });

      ins.connect();
      ins.send('foo');
      return ins.disconnect();
    }));

  return describe('with data', () => {
    before(() => {
      data = noflo.internalSocket.createSocket();
      return c.inPorts.data.attach(data);
    });
    after(() => {
      c.inPorts.data.detach(data);
      return data = null;
    });
    it('should send the supplied data', (done) => {
      out.once('data', (data) => {
        chai.expect(data).to.be.an('object');
        chai.expect(data.foo).to.be.equal('bar');
        return done();
      });

      data.send({ foo: 'bar' });
      ins.send('foo');
      return ins.disconnect();
    });

    it('should send data on a kick IP', (done) => {
      out.once('data', (data) => {
        chai.expect(data).to.be.an('object');
        chai.expect(data.foo).to.be.equal('bar');
        return done();
      });

      data.send({ foo: 'bar' });
      return ins.post(new noflo.IP('data', 'foo'));
    });

    return it('should send data on a kick stream', (done) => {
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
      out.on('data', data => received.push(`DATA ${JSON.stringify(data)}`));
      out.on('endgroup', () => received.push('>'));
      out.on('disconnect', () => {
        received.push('DISC');
        chai.expect(received).to.eql(expected);
        return done();
      });

      data.send({ foo: 'bar' });
      for (var grp of ['foo', 'bar']) { ins.beginGroup(grp); }
      ins.send('foo');
      for (grp of ['foo', 'bar']) { ins.endGroup(); }
      return ins.disconnect();
    });
  });
});
