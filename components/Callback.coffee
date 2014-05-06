noflo = require 'noflo'
{_} = require 'underscore'

class Callback extends noflo.Component
  description: 'This component calls a given callback function for each
  IP it receives.  The Callback component is typically used to connect
  NoFlo with external Node.js code.'
  icon: 'sign-out'

  constructor: ->
    @callback = null

    # We have two input ports. One for the callback to call, and one
    # for IPs to call it with
    @inPorts = new noflo.InPorts
      in:
        description: 'Object passed as argument of the callback'
        datatype: 'all'
      callback:
        description: 'Callback to invoke'
        datatype: 'function'
    # The optional error port is used in case of wrong setups
    @outPorts = new noflo.OutPorts
      error:
        datatype: 'object'

    # Set callback
    @inPorts.callback.on 'data', (data) =>
      unless _.isFunction data
        @error 'The provided callback must be a function'
        return
      @callback = data

    # Call the callback when receiving data
    @inPorts.in.on 'data', (data) =>
      unless @callback
        @error 'No callback provided'
        return
      @callback data

  error: (msg) ->
    if @outPorts.error.isAttached()
      @outPorts.error.send new Error msg
      @outPorts.error.disconnect()
      return
    throw new Error msg

exports.getComponent = -> new Callback
