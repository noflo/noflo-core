noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'Drop component', ->
  c = null
  ins = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/Drop', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()

  describe 'when receiving a packet', ->
    it 'should drop it', (done) ->
      ip = new noflo.IP 'data', 'Foo'
      setTimeout ->
        chai.expect(Object.keys(ip)).to.eql []
        done()
      , 200
      ins.connect()
      ins.send ip
      ins.disconnect()
