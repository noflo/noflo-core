noflo = require 'noflo'

exports.getComponent = ->
  isNode = typeof window is 'undefined'

  c = new noflo.Component
  c.description = 'Returns the value of a global variable.'
  c.icon = 'usd'

  # inPorts
  c.inPorts.add 'name',
    description: 'The name of the global variable.'
    required: true

  # outPorts
  c.outPorts.add 'value',
    description: 'The value of the variable.'
    required: false

  c.outPorts.add 'error',
    description: 'Any errors that occured reading the variables value.'
    required: false

  noflo.helpers.WirePattern c,
    in: ['name']
    out: ['value']
    forwardGroups: true
  ,
    (data, groups, out) ->
      value = if isNode then global[data] else window[data]

      if typeof value is 'undefined'
        err = new Error "\"#{data}\" is undefined on the global object."
        if c.outPorts.error.isAttached()
          c.outPorts.error.send err
        else
          throw err
      else
        out.send value

  return c
