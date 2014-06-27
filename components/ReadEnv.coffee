noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Reads an environment variable'
  c.icon = 'usd'

  c.inPorts.add 'key',
    datatype: 'string'
    required: true
    description: 'Environment variable to read'
  c.outPorts.add 'out',
    datatype: 'string'
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  noflo.helpers.WirePattern c,
    in: 'key'
    out: 'out'
    forwardGroups: true
  , (data, groups, out) ->
    if process.env[data] isnt undefined
      out.send process.env[data]
      return
    c.outPorts.error.send new Error "No environment variable #{data} set"
    c.outPorts.error.disconnect()

  c
