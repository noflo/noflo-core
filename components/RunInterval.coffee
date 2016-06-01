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

  c.process (input, output) ->
    return unless input.has 'interval'

    if input.has 'start'
      start = input.get 'start'
      interval = parseInt input.getData 'interval'
      return unless start.type is 'data'

      if c.timers[start.scope]
        clearInterval c.timers[start.scope]

      c.timers[start.scope] = setInterval ->
        bang = new noflo.IP 'data', true
        bang.scope = start.scope
        c.outPorts.out.sendIP bang
      , interval
      # TODO: Notify network of running generator
      return

    if input.has 'stop'
      stop = input.get 'stop'
      return unless stop.type is 'data'
      return unless c.timers[stop.scope]
      clearInterval c.timers[stop.scope]
      delete c.timers[stop.scope]
      # TODO: Notify network of stopped generator
      return

  c.shutdown = ->
    for scope, interval of c.timers
      clearInterval interval
    c.timers = {}

  c
