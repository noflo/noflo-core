noflo = require 'noflo'

class RepeatAsync extends noflo.Component

  description: "Like 'Repeat', except repeat on next tick"
  icon: 'step-forward'

  constructor: ->
    @groups = []

    # Ports
    @inPorts =
      in: new noflo.Port 'all'
    @outPorts =
      out: new noflo.Port 'all'

    # Forward on next tick
    @inPorts.in.on 'begingroup', (group) =>
      @groups.push(group)

    @inPorts.in.on 'data', (data) =>
      groups = @groups

      later = () =>
        for group in groups
          @outPorts.out.beginGroup(group)

        @outPorts.out.send(data)

        for group in groups
          @outPorts.out.endGroup()

        @outPorts.out.disconnect()

      setTimeout(later, 0)

    @inPorts.in.on 'disconnect', () =>
      @groups = []

exports.getComponent = () -> new RepeatAsync
