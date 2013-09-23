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
  err = null

  beforeEach ->
    c = MakeFunction.getComponent()
    c.inPorts.in.attach noflo.internalSocket.createSocket()
    c.inPorts.function.attach noflo.internalSocket.createSocket()
    c.outPorts.out.attach noflo.internalSocket.createSocket()
    c.outPorts.error.attach noflo.internalSocket.createSocket()
    ins = c.inPorts.in
    func = c.inPorts.function
    out = c.outPorts.out
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

    it 'square function', (done) ->
      func.send 'return data*data;'
      out.on 'data', (data) ->
        chai.expect(data).to.equal 81
        done()
      ins.send 9

    it 'concat function', (done) ->
      func.send 'return data+data;'
      out.on 'data', (data) ->
        chai.expect(data).to.equal "99"
        done()
      ins.send "9"
