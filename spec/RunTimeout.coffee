noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'RunTimeout component', ->
  c = null
  start = null
  time = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/RunTimeout', (err, instance) ->
      return done err if err
      c = instance
      start = noflo.internalSocket.createSocket()
      c.inPorts.start.attach start
      time = noflo.internalSocket.createSocket()
      c.inPorts.time.attach time
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out

  describe 'receiving a time and a bang', ->
    it 'should send a bang out after the timeout', (done) ->
      started = null
      out.on 'data', (data) ->
        received = new Date
        chai.expect(received - started).to.be.at.least 500
        done()

      time.send 500
      started = new Date
      start.send null
      start.disconnect()
