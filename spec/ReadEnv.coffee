noflo = require 'noflo'
chai = require 'chai' unless chai
ReadEnv = require '../components/ReadEnv.coffee'

describe 'ReadEnv component', ->
  c = null
  key = null
  out = null
  err = null

  beforeEach ->
    c = ReadEnv.getComponent()
    key = noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.inPorts.key.attach key
    c.outPorts.out.attach out
    c.outPorts.error.attach err

  describe 'when instantiated', ->
    it 'should have input port', ->
      chai.expect(c.inPorts.key).to.be.an 'object'

    it 'should have an output ports', ->
      chai.expect(c.outPorts.out).to.be.an 'object'
      chai.expect(c.outPorts.error).to.be.an 'object'

  describe 'reading a nonexistent env var', ->
    it 'should return an error', (done) ->
      err.once 'data', (data) ->
        chai.expect(data).to.be.an 'object'
      err.once 'disconnect', ->
        done()
      key.send 'baz'
      key.disconnect()

  describe 'reading a existing env var', ->
    process.env.foo = 'bar'
    it 'should return the value', (done) ->
      out.once 'data', (data) ->
        chai.expect(data).to.equal 'bar'
      out.once 'disconnect', ->
        done()
      key.send 'foo'
      key.disconnect()
