noflo = require 'noflo'

class RunInterval extends noflo.Component
  description: 'Send a packet at the given interval'
  icon: 'clock-o'
  constructor: ->
    @timer = null
    @interval = null
    @inPorts = new noflo.InPorts
      interval:
        datatype: 'number'
        description: 'Interval at which output packets are emitted (ms)'
      start:
        datatype: 'bang'
        description: 'Start the emission'
      stop:
        datatype: 'bang'
        description: 'Stop the emission'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'bang'

    @inPorts.interval.on 'data', (interval) =>
      @interval = interval
      # Restart if currently running
      if @timer?
        clearInterval @timer
        do @start

    @inPorts.start.on 'data', =>
      clearInterval @timer if @timer?
      @outPorts.out.connect()
      do @start

    @inPorts.stop.on 'data', =>
      return unless @timer
      clearInterval @timer
      @timer = null
      @outPorts.out.disconnect()

  start: ->
    out = @outPorts.out
    @timer = setInterval ->
      out.send true
    , @interval

  shutdown: ->
    clearInterval @timer if @timer?

exports.getComponent = -> new RunInterval
