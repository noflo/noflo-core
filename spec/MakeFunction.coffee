noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'MakeFunction component', ->
  c = null
  ins = null
  func = null
  out = null
  outfunc = null
  err = null

  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/MakeFunction', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      func = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      c.inPorts.function.attach func
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    outfunc = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.outPorts.function.attach outfunc
    c.outPorts.error.attach err
  afterEach ->
    c.outPorts.out.detach out
    c.outPorts.function.detach outfunc
    c.outPorts.error.detach err

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(c.inPorts.in).to.be.an 'object'
      chai.expect(c.inPorts.function).to.be.an 'object'

    it 'should have output ports', ->
      chai.expect(c.outPorts.out).to.be.an 'object'
      chai.expect(c.outPorts.error).to.be.an 'object'

  describe 'test function', ->
    it 'without function', (done) ->
      err.on 'data', (data) ->
        chai.expect(data).to.be.an 'error'
        done()

      ins.send 'Foo bar'
      ins.disconnect()

    it 'wrong function', (done) ->
      err.on 'data', (data) ->
        chai.expect(data).to.be.ok
        done()

      func.send 'Foo bar'

    it 'output function', (done) ->
      outfunc.on 'data', (data) ->
        chai.expect(typeof data).to.equal "function"
        chai.expect(data(2)).to.equal 4
        done()
      err.on 'data', (data) ->
        done data
      func.send 'return x*x;'

    it 'square function', (done) ->
      out.on 'data', (data) ->
        chai.expect(data).to.equal 81
        done()
      err.on 'data', (data) ->
        done data
      func.send 'return x*x;'
      ins.send 9
      ins.disconnect()

    it 'concat function', (done) ->
      func.send 'return x+x;'
      out.on 'data', (data) ->
        chai.expect(data).to.equal "99"
        done()
      err.on 'data', (data) ->
        done data
      ins.send "9"
      ins.disconnect()

    it 'pass function', (done) ->
      func.send( (x) -> return x+"!" )
      out.on 'data', (data) ->
        chai.expect(data).to.equal "hello function!"
        done()
      err.on 'data', (data) ->
        done data
      ins.send "hello function"
      ins.disconnect()
