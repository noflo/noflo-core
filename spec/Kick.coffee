noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Kick = require '../components/Kick.coffee'
else
  Kick = require 'noflo-core/components/Kick.js'

describe 'Kick component', ->
  c = null
  ins = null
  data = null
  out = null

  beforeEach ->
    c = Kick.getComponent()
    ins = noflo.internalSocket.createSocket()
    data = noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    c.inPorts.in.attach ins
    c.inPorts.data.attach data
    c.outPorts.out.attach out

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(c.inPorts.in).to.be.an 'object'
      chai.expect(c.inPorts.data).to.be.an 'object'

    it 'should have an output port', ->
      chai.expect(c.outPorts.out).to.be.an 'object'

  describe 'test kick', ->
    it 'test that no packets are sent before disconnect', (done) ->
      sent = false
      out.on 'data', (data) ->
        sent = true

      ins.connect()
      ins.send 'foo'
      setTimeout ->
        chai.expect(sent, 'Should not have sent data').to.be.false
        done()
      , 5

    it 'test kick without specified data', (done) ->
      out.on 'data', (data) ->
        chai.expect(data).to.be.null
        done()

      ins.connect()
      ins.send 'foo'
      ins.disconnect()

    it 'test kick with data', (done) ->
      out.once "data", (data) ->
        chai.expect(data).to.be.an 'object'
        chai.expect(data.foo).to.be.equal 'bar'
        done()

      data.send
        foo: 'bar'
      ins.send 'foo'
      ins.disconnect()

    it 'test kick with no brackets', (done) ->
      out.once "data", (data) ->
        chai.expect(data).to.be.an 'object'
        chai.expect(data.foo).to.be.equal 'bar'
        done()

      data.send
        foo: 'bar'
      ins.post new noflo.IP 'data', 'foo'

    it 'test kick with data and groups', (done) ->
      expected = [
        'CONN'
        '< foo'
        '< bar'
        'DATA {"foo":"bar"}'
        '>'
        '>'
        'DISC'
      ]
      received = []
      out.on 'connect', ->
        received.push 'CONN'
      out.on 'begingroup', (group) ->
        received.push "< #{group}"
      out.on 'data', (data) ->
        received.push "DATA #{JSON.stringify(data)}"
      out.on 'endgroup', ->
        received.push '>'
      out.on 'disconnect', ->
        received.push 'DISC'
        chai.expect(received).to.eql expected
        done()

      data.send
        foo: 'bar'
      ins.beginGroup grp for grp in ['foo', 'bar']
      ins.send 'foo'
      ins.endGroup() for grp in ['foo', 'bar']
      ins.disconnect()
