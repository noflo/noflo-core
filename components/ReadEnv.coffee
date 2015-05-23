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
    async: true
  , (data, groups, out, callback) ->
    value = process.env[data]
    return callback new Error "No environment variable #{data} set" if value is undefined
    out.send process.env[data]
    do callback

  c
