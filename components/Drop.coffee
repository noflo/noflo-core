noflo = require 'noflo'

class Drop extends noflo.Component
  description: 'This component drops every packet it receives with no
  action'
  icon: 'trash-o'

  constructor: ->
    @inPorts =
      in: new noflo.ArrayPort 'all'

    @outPorts = {}

exports.getComponent = -> new Drop
