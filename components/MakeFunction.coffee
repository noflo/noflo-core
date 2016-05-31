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

  c.process (input, output) ->
    if input.has 'function'
      func = input.getData 'function'
      unless typeof func is 'function'
        try
          func = Function 'x', func
        catch e
          output.sendDone e
          return
      unless input.has 'in'
        output.sendDone
          function: func
        return

    unless func
      output.sendDone new Error 'No function defined'
      return

    data = input.getData 'in'
    try
      result = func data
    catch e
      output.sendDone e
      return

    output.sendDone
      function: func
      out: result
