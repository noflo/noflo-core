noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  ReadGlobal = require '../components/ReadGlobal.coffee'
  window = global
else
  ReadGlobal = require 'noflo-core/components/ReadGlobal.js'

expect = chai.expect


describe 'ReadGlobal', ->

  c = null

  beforeEach ->
    c = ReadGlobal.getComponent()

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

      describe 'and a group', ->

        it 'should forward the group', (done) ->
          valueOut.on 'begingroup', (group) ->
            expect(group).to.equal 'group-1'
            done()

          nameIn.beginGroup 'group-1'
          nameIn.send 'TEST_VAR'
          nameIn.endGroup()

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
            expect(err).to.be.instanceof Error
            done()

          nameIn.send 'TEST_VAR'

      describe 'and no error port connected', ->

        it 'should throw the error', ->
          throws = ->
            nameIn.send 'TEST_VAR'

          expect(throws).to.throw Error
