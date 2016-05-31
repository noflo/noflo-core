noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'Merge component', ->
  c = null
  ins1 = null
  ins2 = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/Merge', (err, instance) ->
      return done err if err
      c = instance
      ins1 = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins1
      ins2 = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins2
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out
    out = null

  describe 'when receiving packets from multiple inputs', ->
    it 'should send them as a single stream', (done) ->
      expected = [
        'CONN'
        '< a'
        'DATA 1'
        '>'
        'DISC'
        'CONN'
        '< b'
        'DATA 2'
        '>'
        'DISC'
      ]
      received = []
      out.on 'connect', ->
        received.push 'CONN'
      out.on 'begingroup', (group) ->
        received.push "< #{group}"
      out.on 'data', (data) ->
        received.push "DATA #{data}"
      out.on 'endgroup', ->
        received.push '>'
      out.on 'disconnect', ->
        received.push 'DISC'
        return unless received.length is expected.length
        chai.expect(received).to.eql expected
        done()

      ins1.beginGroup 'a'
      ins1.send 1
      ins1.endGroup()
      ins1.disconnect()

      ins2.beginGroup 'b'
      ins2.send 2
      ins2.endGroup()
      ins2.disconnect()
