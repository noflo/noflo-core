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
    control: true

  c.outPorts.add 'out',
    datatype: 'all'

  c.tearDown = (callback) ->
    clearTimeout timer for timer in c.timers
    c.timers = []
    callback()

  c.process (input, output) ->
    return unless input.hasData 'in'
    delay = input.getData 'delay'
    payload = input.getData 'in'

    timer = setTimeout ->
      c.timers.splice c.timers.indexOf(timer), 1
      output.sendDone
        out: payload
    , delay
    c.timers.push timer
