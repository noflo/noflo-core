noflo = require 'noflo'
owl = require 'owl-deepcopy'

# @runtime noflo-nodejs

class Copy extends noflo.Component
  description: 'deep (i.e. recursively) copy an object'
  icon: 'copy'

  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'Packet to be copied'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send owl.deepCopy data

    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Copy
