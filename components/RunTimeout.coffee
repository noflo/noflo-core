noflo = require 'noflo'

class RunTimeout extends noflo.Component
  description: 'Send a packet after the given time in ms'
  icon: 'clock-o'
  constructor: ->
    @timer = null
    @time = null
    @inPorts =
      time: new noflo.Port 'number'
      start: new noflo.Port 'bang'
      clear: new noflo.Port 'bang'
    @outPorts =
      out: new noflo.Port 'bang'

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
