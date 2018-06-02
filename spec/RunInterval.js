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

describe('RunInterval component', function() {
  let c = null;
  let interval = null;
  let start = null;
  let stop = null;
  let out = null;
  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/RunInterval', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      interval = noflo.internalSocket.createSocket();
      c.inPorts.interval.attach(interval);
      start = noflo.internalSocket.createSocket();
      c.inPorts.start.attach(start);
      stop = noflo.internalSocket.createSocket();
      c.inPorts.stop.attach(stop);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(() => c.outPorts.out.detach(out));

  return describe('running an interval', function() {
    it('should send packets', function(done) {
      this.timeout(6000);
      let received = 0;
      out.on('data', data => received++);

      setTimeout(function() {
        chai.expect(received).to.be.at.least(4);
        return done();
      }
      , 2001);

      interval.send(400);
      start.send(true);
      return start.disconnect();
    });
    return it('should stop after being told to', function(done) {
      this.timeout(6000);
      let received = 0;
      stop.send(true);
      stop.disconnect();
      out.on('data', data => received++);

      setTimeout(function() {
        chai.expect(received).to.be.below(2);
        return done();
      }
      , 1000);

      interval.send(500);
      start.send(true);
      return start.disconnect();
    });
  });
});
