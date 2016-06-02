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

  c.process (input, output) ->
    data = input.getData 'in'
    setTimeout ->
      output.sendDone
        out: data
    , 0
