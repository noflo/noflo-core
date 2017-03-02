noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Returns the value of a global variable.'
  c.icon = 'usd'

  # inPorts
  c.inPorts.add 'name',
    description: 'The name of the global variable.'

  # outPorts
  c.outPorts.add 'value',
    description: 'The value of the variable.'

  c.outPorts.add 'error',
    description: 'Any errors that occured reading the variables value.'

  c.forwardBrackets =
    name: ['value', 'error']

  c.process (input, output) ->
    return unless input.hasData 'name'
    data = input.getData 'name'

    value = unless noflo.isBrowser() then global[data] else window[data]

    if typeof value is 'undefined'
      err = new Error "\"#{data}\" is undefined on the global object."
      output.sendDone err
      return
    output.sendDone
      value: value
