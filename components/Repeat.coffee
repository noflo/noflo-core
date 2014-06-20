noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Forwards packets and metadata in the same way it receives them'
  c.icon = 'forward'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to forward'
  c.outPorts.add 'out',
    datatype: 'all'

  noflo.helpers.WirePattern c,
    in: ['in']
    out: 'out'
    forwardGroups: true
  , (data, groups, out) ->
    out.send data

  c
