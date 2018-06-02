noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Send a packet after the given time in ms'
  c.icon = 'clock-o'

  c.timer = {}

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

  c.stopTimer = (scope) ->
    return unless c.timer[scope]
    clearTimeout c.timer[scope].timeout
    c.timer[scope].deactivate()
    delete c.timer[scope]

  c.tearDown = (callback) ->
    for scope, timer of c.timer
      c.stopTimer scope
    callback()

  c.process (input, output, context) ->
    return unless input.hasData 'time', 'start'
    time = input.getData 'time'
    bang = input.getData 'start'
    # Ensure we deactivate previous timeout, if any
    c.stopTimer input.scope
    # Set up new timer
    context.timeout = setTimeout ->
      c.timer = null
      output.sendDone
        out: true
    , time
    c.timer[input.scope] = context
    return
