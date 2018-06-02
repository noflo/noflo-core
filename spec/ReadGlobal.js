/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let baseDir, chai, window;
const noflo = require('noflo');

if (!noflo.isBrowser()) {
  chai = require('chai');
  const path = require('path');
  baseDir = path.resolve(__dirname, '../');
  window = global;
} else {
  baseDir = 'noflo-core';
}

const { expect } = chai;

describe('ReadGlobal', function() {

  let c = null;

  beforeEach(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('core/ReadGlobal', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      return done();
    });
  });

  describe('inPorts', () =>

    it('should contain "name"', () => expect(c.inPorts.name).to.be.an('object'))
  );

  describe('outPorts', function() {

    it('should contain "value"', () => expect(c.outPorts.value).to.be.an('object'));

    return it('should contain "error"', () => expect(c.outPorts.error).to.be.an('object'));
  });

  return describe('data flow', function() {

    let nameIn = null;
    let valueOut = null;

    beforeEach(function() {
      nameIn = noflo.internalSocket.createSocket();
      valueOut = noflo.internalSocket.createSocket();

      c.inPorts.name.attach(nameIn);
      return c.outPorts.value.attach(valueOut);
    });

    describe('with a defined variable', function() {

      beforeEach(() => window.TEST_VAR = true);

      it('should read a variable from the global object', function(done) {
        valueOut.on('data', function(data) {
          expect(data).to.be.true;
          return done();
        });

        nameIn.send('TEST_VAR');
        return nameIn.disconnect();
      });

      return describe('and a group', () =>

        it('should forward the group', function(done) {
          valueOut.on('begingroup', function(group) {
            expect(group).to.equal('group-1');
            return done();
          });

          nameIn.beginGroup('group-1');
          nameIn.send('TEST_VAR');
          nameIn.endGroup();
          return nameIn.disconnect();
        })
      );
    });

    return describe('with an undefined variable', function() {

      beforeEach(() => delete window.TEST_VAR);

      return describe('and the error port connected', function() {

        let errorOut = null;

        beforeEach(function() {
          errorOut = noflo.internalSocket.createSocket();

          return c.outPorts.error.attach(errorOut);
        });

        return it('should send the error', function(done) {
          errorOut.on('data', function(err) {
            expect(err).to.be.an('error');
            return done();
          });

          nameIn.send('TEST_VAR');
          return nameIn.disconnect();
        });
      });
    });
  });
});
