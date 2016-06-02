noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Forwards any packets, but also sends a disconnect after
  each of them'
  c.icon = 'pause'
  c.forwardBrackets = {}
  c.autoOrdering = false

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be forward with disconnection'
  c.outPorts.add 'out',
    datatype: 'all'

  brackets = []
  c.process (input, output) ->
    # Force auto-ordering to be off for this one
    c.autoOrdering = false

    data = input.get 'in'
    if data.type is 'openBracket'
      brackets.push data.data
      return
    if data.type is 'closeBracket'
      brackets.pop()
      return

    return unless data.type is 'data'

    for bracket in brackets
      output.sendIP 'out', new noflo.IP 'openBracket', bracket
    output.sendIP 'out', data
    for bracket in brackets
      output.sendIP 'out', new noflo.IP 'closeBracket', bracket

    output.done()

  c.shutdown = ->
    brackets = []

  c
