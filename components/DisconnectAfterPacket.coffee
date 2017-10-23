noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Makes each data packet a stream of its own'
  c.icon = 'pause'
  c.forwardBrackets = {}
  c.autoOrdering = false

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be forward with disconnection'
  c.outPorts.add 'out',
    datatype: 'all'

  brackets = {}
  c.tearDown = (callback) ->
    brackets = {}
  c.process (input, output) ->
    # Force auto-ordering to be off for this one
    c.autoOrdering = false

    data = input.get 'in'
    brackets[input.scope] = [] unless brackets[input.scope]
    if data.type is 'openBracket'
      brackets[input.scope].push data.data
      output.done()
      return
    if data.type is 'closeBracket'
      brackets[input.scope].pop()
      output.done()
      return

    return unless data.type is 'data'

    for bracket in brackets[input.scope]
      output.sendIP 'out', new noflo.IP 'openBracket', bracket
    output.sendIP 'out', data
    closes = brackets[input.scope].slice 0
    closes.reverse()
    for bracket in closes
      output.sendIP 'out', new noflo.IP 'closeBracket', bracket

    output.done()
