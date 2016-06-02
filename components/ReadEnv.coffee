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

  c.forwardBrackets =
    key: ['out', 'error']

  c.process (input, output) ->
    data = input.getData 'key'
    return unless data
    value = process.env[data]
    if value is undefined
      output.sendDone new Error "No environment variable #{data} set"
      return
    output.sendDone
      out: value
