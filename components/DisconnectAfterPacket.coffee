noflo = require 'noflo'

class DisconnectAfterPacket extends noflo.Component
  description: 'Forwards any packets, but also sends a disconnect after each of them'
  icon: 'pause'
  constructor: ->
    @inPorts =
      in: new noflo.Port 'all'
    @outPorts =
      out: new noflo.Port 'all'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send data
      @outPorts.out.disconnect()
    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

exports.getComponent = -> new DisconnectAfterPacket
