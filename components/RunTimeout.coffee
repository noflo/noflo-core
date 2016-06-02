noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Send a packet after the given time in ms'
  c.icon = 'clock-o'

  c.timer = null

  c.inPorts.add 'time',
    datatype: 'number'
    description: 'Time after which a packet will be sent'
    required: true
    control: true
  c.inPorts.add 'start',
    datatype: 'bang'
    description: 'Start the timeout before sending a packet'
  c.outPorts.add 'out',
    datatype: 'bang'

  c.forwardBrackets =
    start: ['out']

  c.process (input, output) ->
    return unless input.has 'time', 'start'
    time = input.getData 'time'
    c.stopTimer() if c.timer
    c.timer = setTimeout ->
      c.timer = null
      output.sendDone
        out: true
    , time

  c.stopTimer = ->
    return unless c.timer
    clearTimeout c.timer
    c.timer = null

  c.shutdown = ->
    c.stopTimer()

  c
