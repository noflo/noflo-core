noflo = require 'noflo'

class Drop extends noflo.Component
  description: 'This component drops every packet it receives with no
  action'
  icon: 'trash-o'

  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatypes: 'all'
        description: 'Packet to be dropped'
    @outPorts = new noflo.OutPorts

exports.getComponent = -> new Drop
