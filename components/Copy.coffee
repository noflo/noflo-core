noflo = require 'noflo'
owl = require 'owl-deepcopy'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'deep (i.e. recursively) copy an object'
  c.icon = 'copy'

  c.inPorts.add 'in',
    datatype: 'all'
    description: 'Packet to be copied'
  c.outPorts.add 'out',
    datatype: 'all'
    description: 'Copy of the original packet'

  c.process (input, output) ->
    data = input.get 'in'
    return unless data.type is 'data'

    copy = owl.deepCopy data
    output.sendDone
      out: copy
    return
