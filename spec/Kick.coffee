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
      out.once "data", (data) ->
        sent = true

      ins.send 'foo'
      setTimeout ->
        chai.expect(sent).to.be.false
        done()
      , 5

    it 'test kick without specified data', (done) ->
      out.once "data", (data) ->
        chai.expect(data).to.be.null
        done()

      ins.send 'foo'
      ins.disconnect()

    it 'test kick with data', (done) ->
      out.once "data", (data) ->
        chai.expect(data.foo).to.be.ok
        chai.expect(data.foo).to.be.equal 'bar'
        done()

      data.send
        foo: 'bar'
      ins.send 'foo'
      ins.disconnect()

    it 'test kick with data and groups', (done) ->
      expectedGroups = [
        'foo'
        'bar'
      ]
      receivedGroups = []
      out.on 'begingroup', (group) =>
        receivedGroups.push group
      out.once "data", (data) ->
        chai.expect(data.foo).to.be.ok
        chai.expect(data.foo).to.be.equal 'bar'
        chai.expect(receivedGroups).to.eql expectedGroups
        done()

      data.send
        foo: 'bar'
      for grp in expectedGroups
        ins.beginGroup grp
      ins.send 'foo'
      for grp in expectedGroups
        ins.endGroup grp
      ins.disconnect()
