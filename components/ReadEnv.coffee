noflo = require 'noflo'

class ReadEnv extends noflo.Component
  constructor: ->
    @inPorts =
      key: new noflo.Port 'string'
    @outPorts =
      out: new noflo.ArrayPort 'string'
      error: new noflo.Port 'string'

    @inPorts.key.on 'data', (data) =>
      if process.env[data] isnt undefined
        return @outPorts.out.send process.env[data]
      if @outPorts.error.isAttached()
        @outPorts.error.send "No environment variable #{data} set"

exports.getComponent = -> new ReadEnv
