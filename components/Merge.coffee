noflo = require 'noflo'

class Merge extends noflo.Component
  description: 'This component receives data on multiple input ports and
    sends the same data out to the connected output port'
  icon: 'compress'

  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'Packet to be forwarded'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.in.on 'connect', =>
      @outPorts.out.connect()
    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send data
    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()
    @inPorts.in.on 'disconnect', =>
      # Check that all ports have disconnected before emitting
      for socket in @inPorts.in.sockets
        return if socket.connected
      @outPorts.out.disconnect()

exports.getComponent = -> new Merge
