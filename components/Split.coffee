noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'expand'
  c.description = 'This component receives data on a single input port and
    sends the same data out to all connected output ports'

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be forwarded'

  c.outPorts.add 'out',
    datatype: 'all'

  noflo.helpers.WirePattern c,
    in: 'in'
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    out.send data
    do callback

  c
