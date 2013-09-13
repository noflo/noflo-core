noflo = require 'noflo'

class DisconnectAfterPacket extends noflo.Component
  constructor: ->
    @inPorts =
      in: new noflo.Port()
    @outPorts =
      out: new noflo.Port()

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send data
      @outPorts.out.disconnect()
    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

exports.getComponent = -> new DisconnectAfterPacket
