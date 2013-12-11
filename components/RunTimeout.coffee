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

    @inPorts.time.on 'data', (time) =>
      @time = time
      # Restart if currently running
      if @timer?
        clearTimeout @timer
        @timer = setTimeout =>
          @outPorts.out.send true
        , @time

    @inPorts.start.on 'data', =>
      clearTimeout @timer if @timer?
      @outPorts.out.connect()
      @timer = setTimeout =>
        @outPorts.out.send true
        @outPorts.out.disconnect()
      , @time

    @inPorts.clear.on 'data', =>
      return unless @timer
      clearTimeout @timer
      @timer = null
      @outPorts.out.disconnect()

  shutdown: ->
    clearTimeout @timer if @timer?

exports.getComponent = -> new RunTimeout
