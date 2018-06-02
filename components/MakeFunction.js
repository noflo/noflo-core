noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Evaluates a function each time data hits the "in" port
  and sends the return value to "out". Within the function "x" will
  be the variable from the in port. For example, to make a ^2 function
  input "return x*x;" to the function port.'
  c.icon = 'code'

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be processed'
  c.inPorts.add 'function',
    datatype: 'string'
    description: 'Function to evaluate'
    control: true
  c.outPorts.add 'out',
    datatype: 'all'
  c.outPorts.add 'function',
    datatype: 'function'
  c.outPorts.add 'error',
    datatype: 'object'

  prepareFunction = (func, callback) ->
    if typeof func is 'function'
      callback null, func
      return
    try
      newFunc = Function 'x', func
    catch e
      callback e
      return
    callback null, newFunc

  c.process (input, output) ->
    return if input.attached('in').length and not input.hasData 'in'
    if input.hasData 'function', 'in'
      # Both function and input data
      prepareFunction input.getData('function'), (err, func) ->
        if err
          output.done e
          return
        data = input.getData 'in'
        try
          result = func data
        catch e
          output.done e
          return
        output.sendDone
          function: func
          out: result
        return
      return
    return unless input.hasData 'function'
    prepareFunction input.getData('function'), (err, func) ->
      if err
        output.done e
        return
      output.sendDone
        function: func
      return
    return
