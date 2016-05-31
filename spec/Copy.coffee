noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'Copy component', ->
  c = null
  ins = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/Copy', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out
    out = null

  describe 'when receiving an object', ->
    it 'should send a copy of the object', (done) ->
      original =
        hello: 'world'
        list: [1, 2, 3]

      out.on 'data', (data) ->
        chai.expect(data).to.eql original
        chai.expect(data).to.not.equal original
        done()

      ins.send original
      ins.disconnect()
