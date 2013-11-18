noflo = require 'noflo'

class RunInterval extends noflo.Component
  description: 'Send a packet at the given interval'
  icon: 'clock-o'
  constructor: ->
    @timer = null
    @interval = null
    @inPorts =
      interval: new noflo.Port 'number'
      start: new noflo.Port 'bang'
      stop: new noflo.Port 'bang'
    @outPorts =
      out: new noflo.Port 'bang'

    @inPorts.interval.on 'data', (interval) =>
      @interval = interval
      # Restart if currently running
      if @timer?
        clearInterval @timer
        @timer = setInterval =>
          @outPorts.out.send true
        , @interval

    @inPorts.start.on 'data', =>
      clearInterval @timer if @timer?
      @outPorts.out.connect()
      @timer = setInterval =>
        @outPorts.out.send true
      , @interval

    @inPorts.stop.on 'data', =>
      return unless @timer
      clearInterval @timer
      @timer = null
      @outPorts.out.disconnect()

  shutdown: ->
    clearInterval @timer if @timer?

exports.getComponent = -> new RunInterval
