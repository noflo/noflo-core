noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Send a packet at the given interval'
  c.icon = 'clock-o'
  c.inPorts.add 'interval',
    datatype: 'number'
    description: 'Interval at which output packets are emitted (ms)'
    required: true
    control: true
  c.inPorts.add 'start',
    datatype: 'bang'
    description: 'Start the emission'
  c.inPorts.add 'stop',
    datatype: 'bang'
    description: 'Stop the emission'
  c.outPorts.add 'out',
    datatype: 'bang'

  c.timers = {}

  cleanUp = (scope) ->
    return unless c.timers[scope]
    clearInterval c.timers[scope].interval
    c.timers[scope].deactivate()
    c.timers[scope] = null

  c.tearDown = (callback) ->
    for scope, context of c.timers
      cleanUp scope
    c.timers = {}
    callback()

  c.process (input, output, context) ->
    if input.hasData 'start'
      return unless input.hasData 'interval'
      start = input.get 'start'
      return unless start.type is 'data'
      interval = parseInt input.getData 'interval'
      # Ensure we deactivate previous interval in this scope, if any
      cleanUp start.scope

      # Set up interval
      context.interval = setInterval ->
        bang = new noflo.IP 'data', true
        bang.scope = start.scope
        c.outPorts.out.sendIP bang
      , interval

      # Register scope, we keep it active until stopped
      c.timers[start.scope] = context
      return

    if input.hasData 'stop'
      stop = input.get 'stop'
      return unless stop.type is 'data'
      # Deactivate interval in this scope
      cleanUp stop.scope
      return
