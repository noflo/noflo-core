noflo = require 'noflo'

class RepeatDelayed extends noflo.AsyncComponent
  description: 'Forward packet after a set delay'
  icon: 'clock-o'
  constructor: ->
    @timers = []
    @delay = 0
    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'Packet to be forwarded with a delay'
      delay:
        datatype: 'number'
        description: 'How much to delay'
        default: 500
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.delay.on 'data', (@delay) =>

    super()

  doAsync: (packet, callback) ->
    timer = setTimeout =>
      @outPorts.out.send packet
      callback()
      @timers.splice @timers.indexOf(timer), 1
    , @delay
    @timers.push timer

  shutdown: ->
    clearTimeout timer for timer in @timers
    @timers = []

exports.getComponent = -> new RepeatDelayed
