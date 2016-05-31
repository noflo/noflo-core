noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'This component generates a single packet and sends it to
  the output port. Mostly usable for debugging, but can also be useful
  for starting up networks.'
  c.icon = 'share'

  c.inPorts.add 'in',
    datatype: 'bang'
    description: 'Signal to send the data packet'
  c.inPorts.add 'data',
    datatype: 'all'
    description: 'Packet to be sent'
    control: true
    default: null
  c.outPorts.add 'out',
    datatype: 'all'

  brackets = []
  scope = []
  c.ordered = true
  c.forwardBrackets = {}
  c.process (input, output) ->
    return unless input.has 'in'
    data = input.get 'in'
    if data.type is 'openBracket'
      brackets.push data.data
    if data.type is 'closeBracket'
      brackets.pop()
    if data.type is 'data'
      scope = brackets.slice 0

    if data.type in ['data', 'closeBracket'] and brackets.length is 0
      content = input.get 'data'
      for bracket in scope
        output.sendIP 'out', new noflo.IP 'openBracket', bracket
      output.sendIP 'out', content
      for bracket in scope
        output.sendIP 'out', new noflo.IP 'closeBracket', bracket

    output.done()

  c.shutdown = ->
    brackets = []
    scope = []

  c
