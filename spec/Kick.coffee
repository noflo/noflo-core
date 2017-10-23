noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'Kick component', ->
  c = null
  ins = null
  data = null
  out = null

  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/Kick', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()
  beforeEach (done) ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.start done
  afterEach (done) ->
    c.outPorts.out.detach out
    out = null
    c.shutdown done

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(c.inPorts.in).to.be.an 'object'
      chai.expect(c.inPorts.data).to.be.an 'object'

    it 'should have an output port', ->
      chai.expect(c.outPorts.out).to.be.an 'object'

  describe 'without full stream', ->
    it 'should not send anything', (done) ->
      sent = false
      out.on 'data', (data) ->
        sent = true

      ins.beginGroup 'bar'
      ins.send 'foo'
      setTimeout ->
        chai.expect(sent, 'Should not have sent data').to.be.false
        c.shutdown (err) ->
          return done err if err
          c.start done
      , 5

  describe 'without specified data', ->
    it 'it should send a NULL', (done) ->
      out.on 'data', (data) ->
        chai.expect(data).to.be.null
        done()

      ins.connect()
      ins.send 'foo'
      ins.disconnect()

  describe 'with data', ->
    before ->
      data = noflo.internalSocket.createSocket()
      c.inPorts.data.attach data
    after ->
      c.inPorts.data.detach data
      data = null
    it 'should send the supplied data', (done) ->
      out.once "data", (data) ->
        chai.expect(data).to.be.an 'object'
        chai.expect(data.foo).to.be.equal 'bar'
        done()

      data.send
        foo: 'bar'
      ins.send 'foo'
      ins.disconnect()

    it 'should send data on a kick IP', (done) ->
      out.once "data", (data) ->
        chai.expect(data).to.be.an 'object'
        chai.expect(data.foo).to.be.equal 'bar'
        done()

      data.send
        foo: 'bar'
      ins.post new noflo.IP 'data', 'foo'

    it 'should send data on a kick stream', (done) ->
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
