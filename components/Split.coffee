noflo = require 'noflo'

class Split extends noflo.Component
  description: 'This component receives data on a single input port and
    sends the same data out to all connected output ports'
  icon: 'expand'

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
      @outPorts.out.disconnect()

exports.getComponent = -> new Split
