noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = "Like 'Repeat', except repeat on next tick"
  c.icon = 'step-forward'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to forward'
  c.outPorts.add 'out',
    datatype: 'all'

  noflo.helpers.WirePattern c,
    in: ['in']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    setTimeout ->
      out.send data
      do callback
    , 0

  c
