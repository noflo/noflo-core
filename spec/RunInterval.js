noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'RunInterval component', ->
  c = null
  interval = null
  start = null
  stop = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/RunInterval', (err, instance) ->
      return done err if err
      c = instance
      interval = noflo.internalSocket.createSocket()
      c.inPorts.interval.attach interval
      start = noflo.internalSocket.createSocket()
      c.inPorts.start.attach start
      stop = noflo.internalSocket.createSocket()
      c.inPorts.stop.attach stop
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out

  describe 'running an interval', ->
    it 'should send packets', (done) ->
      @timeout 6000
      received = 0
      out.on 'data', (data) ->
        received++

      setTimeout ->
        chai.expect(received).to.be.at.least 4
        done()
      , 2001

      interval.send 400
      start.send true
      start.disconnect()
    it 'should stop after being told to', (done) ->
      @timeout 6000
      received = 0
      stop.send true
      stop.disconnect()
      out.on 'data', (data) ->
        received++

      setTimeout ->
        chai.expect(received).to.be.below 2
        done()
      , 1000

      interval.send 500
      start.send true
      start.disconnect()
