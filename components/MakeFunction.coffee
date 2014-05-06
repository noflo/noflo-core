noflo = require 'noflo'

class MakeFunction extends noflo.Component
  description: 'Evaluates a function each time data hits the "in" port
  and sends the return value to "out". Within the function "x" will
  be the variable from the in port. For example, to make a ^2 function
  input "return x*x;" to the function port.'
  icon: 'code'

  constructor: ->
    @f = null

    # We have two input ports. One for the callback to call, and one
    # for IPs to call it with
    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'Packet to be processed'
      function:
        datatype: 'string'
        description: 'Function to evaluate'
    # The optional error port is used in case of wrong setups
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'
      function:
        datatype: 'function'
      error:
        datatype: 'object'

    # Set callback
    @inPorts.function.on 'data', (data) =>
      if typeof data is "function"
        @f = data
      else
        try
          @f = Function("x", data)
        catch error
          @error 'Error creating function: ' + data
      if @f and @outPorts.function.isAttached()
        @outPorts.function.send @f


    # Evaluate the function when receiving data
    @inPorts.in.on 'data', (data) =>
      unless @f
        @error 'No function defined'
        return
      try
        @outPorts.out.send @f data
      catch error
        @error 'Error evaluating function.'

  error: (msg) ->
    if @outPorts.error.isAttached()
      @outPorts.error.send new Error msg
      @outPorts.error.disconnect()
      return
    throw new Error msg

exports.getComponent = -> new MakeFunction
