noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Callback = require '../components/Callback.coffee'
else
  Callback = require 'noflo-core/components/Callback.js'

describe 'Callback component', ->
  c = null
  ins = null
  cb = null
  err = null

  beforeEach ->
    c = Callback.getComponent()
    ins = noflo.internalSocket.createSocket()
    cb = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.inPorts.in.attach ins
    c.inPorts.callback.attach cb
    c.outPorts.error.attach err

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(c.inPorts.in).to.be.an 'object'
      chai.expect(c.inPorts.callback).to.be.an 'object'

    it 'should have an output port', ->
      chai.expect(c.outPorts.error).to.be.an 'object'

  describe 'test callback', ->
    it 'without callback', (done) ->
      err.on 'data', (data) ->
        chai.expect(data).to.be.ok
        done()

      ins.send 'Foo bar'

    it 'wrong callback', (done) ->
      err.on 'data', (data) ->
        chai.expect(data).to.be.ok
        done()

      cb.send 'Foo bar'

    it 'right callback', (done) ->
      callback = (data) ->
        chai.expect(data).to.equal 'hello, world'
        done()
      cb.send callback

      ins.send 'hello, world'
