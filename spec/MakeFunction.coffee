noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  MakeFunction = require '../components/MakeFunction.coffee'
else
  MakeFunction = require 'noflo-core/components/MakeFunction.js'

describe 'MakeFunction component', ->
  c = null
  ins = null
  func = null
  out = null
  outfunc = null
  err = null

  beforeEach ->
    c = MakeFunction.getComponent()
    c.inPorts.in.attach noflo.internalSocket.createSocket()
    c.inPorts.function.attach noflo.internalSocket.createSocket()
    c.outPorts.out.attach noflo.internalSocket.createSocket()
    c.outPorts.function.attach noflo.internalSocket.createSocket()
    c.outPorts.error.attach noflo.internalSocket.createSocket()
    ins = c.inPorts.in
    func = c.inPorts.function
    out = c.outPorts.out
    outfunc = c.outPorts.function
    err = c.outPorts.error

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
        chai.expect(data).to.be.ok
        done()

      ins.send 'Foo bar'

    it 'wrong function', (done) ->
      err.on 'data', (data) ->
        chai.expect(data).to.be.ok
        done()

      func.send 'Foo bar'

    it 'output function', (done) ->
      outfunc.on 'data', (data) ->
        chai.expect(typeof data).to.equal "function"
        done()
      func.send 'return x*x;'

    it 'square function', (done) ->
      func.send 'return x*x;'
      out.on 'data', (data) ->
        chai.expect(data).to.equal 81
        done()
      ins.send 9

    it 'concat function', (done) ->
      func.send 'return x+x;'
      out.on 'data', (data) ->
        chai.expect(data).to.equal "99"
        done()
      ins.send "9"

    it 'pass function', (done) ->
      func.send( (x) -> return x+"!" )
      out.on 'data', (data) ->
        chai.expect(data).to.equal "hello function!"
        done()
      ins.send "hello function"
