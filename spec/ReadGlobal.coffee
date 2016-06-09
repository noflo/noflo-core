noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
  window = global
else
  baseDir = 'noflo-core'

expect = chai.expect

describe 'ReadGlobal', ->

  c = null

  beforeEach (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/ReadGlobal', (err, instance) ->
      return done err if err
      c = instance
      done()

  describe 'inPorts', ->

    it 'should contain "name"', ->
      expect(c.inPorts.name).to.be.an 'object'

  describe 'outPorts', ->

    it 'should contain "value"', ->
      expect(c.outPorts.value).to.be.an 'object'

    it 'should contain "error"', ->
      expect(c.outPorts.error).to.be.an 'object'

  describe 'data flow', ->

    nameIn = null
    valueOut = null

    beforeEach ->
      nameIn = noflo.internalSocket.createSocket()
      valueOut = noflo.internalSocket.createSocket()

      c.inPorts.name.attach nameIn
      c.outPorts.value.attach valueOut

    describe 'with a defined variable', ->

      beforeEach ->
        window.TEST_VAR = true

      it 'should read a variable from the global object', (done) ->
        valueOut.on 'data', (data) ->
          expect(data).to.be.true
          done()

        nameIn.send 'TEST_VAR'
        nameIn.disconnect()

      describe 'and a group', ->

        it 'should forward the group', (done) ->
          valueOut.on 'begingroup', (group) ->
            expect(group).to.equal 'group-1'
            done()

          nameIn.beginGroup 'group-1'
          nameIn.send 'TEST_VAR'
          nameIn.endGroup()
          nameIn.disconnect()

    describe 'with an undefined variable', ->

      beforeEach ->
        delete window.TEST_VAR

      describe 'and the error port connected', ->

        errorOut = null

        beforeEach ->
          errorOut = noflo.internalSocket.createSocket()

          c.outPorts.error.attach errorOut

        it 'should send the error', (done) ->
          errorOut.on 'data', (err) ->
            expect(err).to.be.an 'error'
            done()

          nameIn.send 'TEST_VAR'
          nameIn.disconnect()
