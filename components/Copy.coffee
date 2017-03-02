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
    return unless input.hasData 'in'
    data = input.getData 'in'

    copy = owl.deepCopy data
    output.sendDone
      out: copy
    return
