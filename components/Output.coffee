noflo = require 'noflo'

unless noflo.isBrowser()
  util = require 'util'
else
  util =
    inspect: (data) -> data

class Output extends noflo.Component
  description: 'This component receives input on a single inport, and
    sends the data items directly to console.log'
  icon: 'bug'

  constructor: ->
    @options = null

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'Packet to be printed through console.log'
      options:
        datatype: 'object'
        description: 'Options to be passed to console.log'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.in.on 'data', (data) =>
      @log data
      @outPorts.out.send data if @outPorts.out.isAttached()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect() if @outPorts.out.isAttached()

    @inPorts.options.on 'data', (data) =>
      @setOptions data

  setOptions: (options) ->
    throw new Error 'Options is not an object' unless typeof options is 'object'
    @options ?= {}
    for own key, value of options
      @options[key] = value

  log: (data) ->
    if @options?
      console.log util.inspect data,
        @options.showHidden, @options.depth, @options.colors
    else
      console.log data

exports.getComponent = -> new Output()
