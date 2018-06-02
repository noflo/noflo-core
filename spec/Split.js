noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-core'

describe 'Split component', ->
  c = null
  ins = null
  out = null

  beforeEach (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'core/Split', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      out = noflo.internalSocket.createSocket()
      c.outPorts.out.attach out
      done()

  describe 'when instantiated', ->
    it 'should have an input port', ->
      chai.expect(c.inPorts.in).to.be.an 'object'

    it 'should have an output port', ->
      chai.expect(c.outPorts.out).to.be.an 'object'

  describe 'when sending no packet, only groups', ->
    it 'should forward no packet', (done) ->
      @timeout 500
      setTimeout done, 100
      ins.beginGroup 'foo'
      ins.endGroup()

  describe 'when sending only one packet', ->
    it 'should forward the packet', (done) ->
      out.on 'data', (data) ->
        chai.expect(data).to.equal 'foo'
        done()
      ins.send 'foo'
    it 'should forward groups', (done) ->
      groups = []
      out.on 'begingroup', (group) ->
        groups.push group
      out.on 'endgroup', ->
        groups.pop()
      out.on 'data', (data) ->
        chai.expect(data).to.equal 'foo'
        chai.expect(groups[0]).to.equal 'bar'
        done()
      ins.beginGroup 'bar'
      ins.send 'foo'
      ins.endGroup()

  describe 'when sending many packets', ->
    it 'should forward all packets', (done) ->
      ids = ['foo', 'bar', 'baz']
      packets = []
      out.on 'data', (data) ->
        packets.push data
        if packets.length > 2
          chai.expect(packets.length).to.deep.equal 3
          for id in ids
            chai.expect(packets).to.include id
          packets = []
          done()
      for id in ids
        ins.send id
    it 'should forward the right groups', (done) ->
      ids = ['foo', 'bar', 'baz']
      packets = []
      groups = []
      out.on 'begingroup', (group) ->
        groups.push group
      out.on 'endgroup', ->
        groups.pop()
      out.on 'data', (data) ->
        packets.push
          data: data
          groups: groups.slice 0
        if packets.length > 2
          chai.expect(packets.length).to.deep.equal 3
          for id in ids
            allData = (packet.data for packet in packets)
            idGroups = (packet.groups for packet in packets when packet.data is id)
            chai.expect(allData).to.include id
            chai.expect(idGroups[0]).to.deep.equal [ "group-of-#{id}" ]
          packets = []
          done()
      for id in ids
        ins.beginGroup "group-of-#{id}"
        ins.send id
        ins.endGroup()
