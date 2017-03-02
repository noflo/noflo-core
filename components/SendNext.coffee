noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Sends next packet in buffer when receiving a bang'
  c.icon = 'forward'

  c.inPorts.add 'data',
    datatype: 'all'
  c.inPorts.add 'in',
    datatype: 'bang'
  c.outPorts.add 'out',
    datatype: 'all'
  c.outPorts.add 'empty',
    datatype: 'bang'
    required: false

  c.forwardBrackets = {}
  c.process (input, output) ->
    return unless input.hasData 'in'
    bang = input.get 'in'
    return unless bang.type is 'data'

    unless input.hasData 'data'
      # No data packets in the buffer, send "empty"
      output.sendDone
        empty: true
      return

    sent = false
    # Loop until we've either drained the buffer completely, or until
    # we hit the next data packet
    while input.has 'data'
      if sent
        # If we already sent data, we look ahead to see if next packet is data and bail out
        buf = c.inPorts.data.getBuffer bang.scope
        break if buf[0].type is 'data'

      packet = input.get 'data'
      output.send
        out: packet
      sent = true if packet.type is 'data'
    # After the loop we can deactivate
    output.done()
