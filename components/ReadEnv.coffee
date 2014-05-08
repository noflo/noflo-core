noflo = require 'noflo'

# @runtime noflo-nodejs

class ReadEnv extends noflo.Component
  description: 'Reads an environment variable'
  icon: 'dollar'
  constructor: ->
    @inPorts = new noflo.InPorts
      key:
        datatype: 'string'
        description: 'Environment variable to read'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
      error:
        datatype: 'string'

    @inPorts.key.on 'data', (data) =>
      if process.env[data] isnt undefined
        @outPorts.out.send process.env[data]
        @outPorts.out.disconnect()
        return
      if @outPorts.error.isAttached()
        @outPorts.error.send "No environment variable #{data} set"
        @outPorts.error.disconnect()

exports.getComponent = -> new ReadEnv
