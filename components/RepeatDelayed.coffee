noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Forward packet after a set delay'
  c.icon = 'clock-o'

  c.timers = []

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be forwarded with a delay'
  c.inPorts.add 'delay',
    datatype: 'number'
    description: 'How much to delay'
    default: 500

  c.outPorts.add 'out',
    datatype: 'all'

  noflo.helpers.WirePattern c,
    in: 'in'
    params: 'delay'
    out: 'out'
    forwardGroups: true
    async: true
  , (payload, groups, out, callback) ->
    timer = setTimeout =>
      out.send payload
      do callback
      c.timers.splice c.timers.indexOf(timer), 1
    , c.params.delay
    c.timers.push timer

  c.shutdown = ->
    clearTimeout timer for timer in c.timers
    c.timers = []
  
  c
