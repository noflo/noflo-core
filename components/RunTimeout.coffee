noflo = require 'noflo'

class RunTimeout extends noflo.Component
  description: 'Send a packet after the given time in ms'
  icon: 'clock-o'
  constructor: ->
    @timer = null
    @time = null
    @inPorts = new noflo.InPorts
      time:
        datatype: 'number'
        description: 'Time after which a packet will be sent'
      start:
        datatype: 'bang'
        description: 'Start the timeout before sending a packet'
      clear:
        datatype: 'bang'
        description: 'Clear the timeout'
        required: no
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'bang'

    @inPorts.time.on 'data', (@time) =>
      @startTimer()

    @inPorts.start.on 'data', =>
      @startTimer()

    @inPorts.clear.on 'data', =>
      @stopTimer() if @timer

  startTimer: ->
    @stopTimer() if @timer
    @outPorts.out.connect()
    @timer = setTimeout =>
      @outPorts.out.send true
      @outPorts.out.disconnect()
      @timer = null
    , @time

  stopTimer: ->
    return unless @timer
    clearTimeout @timer
    @timer = null
    @outPorts.out.disconnect()

  shutdown: ->
    @stopTimer() if @timer

exports.getComponent = -> new RunTimeout
