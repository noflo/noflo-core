describe('ReadGlobal', () => {
  let c = null;

  beforeEach(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('core/ReadGlobal', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      done();
    });
  });

  describe('inPorts', () => {
    it('should contain "name"', () => {
      chai.expect(c.inPorts.name).to.be.an('object');
    });
  });

  describe('outPorts', () => {
    it('should contain "value"', () => {
      chai.expect(c.outPorts.value).to.be.an('object');
    });

    it('should contain "error"', () => {
      chai.expect(c.outPorts.error).to.be.an('object');
    });
  });

  return describe('data flow', () => {
    let nameIn = null;
    let valueOut = null;

    beforeEach(() => {
      nameIn = noflo.internalSocket.createSocket();
      valueOut = noflo.internalSocket.createSocket();

      c.inPorts.name.attach(nameIn);
      c.outPorts.value.attach(valueOut);
    });

    describe('with a defined variable', () => {
      beforeEach(() => {
        if (noflo.isBrowser()) {
          window.TEST_VAR = true;
        } else {
          global.TEST_VAR = true;
        }
      });

      it('should read a variable from the global object', (done) => {
        valueOut.on('data', (data) => {
          chai.expect(data).to.equal(true);
          done();
        });

        nameIn.send('TEST_VAR');
        nameIn.disconnect();
      });

      describe('and a group', () => {
        it('should forward the group', (done) => {
          valueOut.on('begingroup', (group) => {
            chai.expect(group).to.equal('group-1');
            done();
          });

          nameIn.beginGroup('group-1');
          nameIn.send('TEST_VAR');
          nameIn.endGroup();
          nameIn.disconnect();
        });
      });
    });

    describe('with an undefined variable', () => {
      beforeEach(() => {
        if (noflo.isBrowser()) {
          delete window.TEST_VAR;
        } else {
          delete global.TEST_VAR;
        }
      });

      describe('and the error port connected', () => {
        let errorOut = null;

        beforeEach(() => {
          errorOut = noflo.internalSocket.createSocket();
          c.outPorts.error.attach(errorOut);
        });

        it('should send the error', (done) => {
          errorOut.on('data', (err) => {
            chai.expect(err).to.be.an('error');
            done();
          });

          nameIn.send('TEST_VAR');
          nameIn.disconnect();
        });
      });
    });
  });
});
