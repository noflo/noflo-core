noflo = require 'noflo'

class SendNext extends noflo.Component
  description: 'Sends next packet in buffer when receiving a bang'
  icon: 'forward'

  constructor: ->
    @inPorts = new noflo.InPorts
      data:
        datatype: 'all'
        buffered: yes
      in:
        datatype: 'bang'

    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.in.on 'data', =>
      do @sendNext

  sendNext: ->
    sent = false
    loop
      packet = @inPorts.data.receive()
      break unless packet
      groups = []
      switch packet.event
        when 'begingroup'
          @outPorts.out.beginGroup packet.payload
          groups.push packet.payload
        when 'data'
          if sent
            # Return packet to beginning of queue and abort
            @inPorts.data.buffer.unshift packet
            return
          @outPorts.out.send packet.payload
          sent = true
        when 'endgroup'
          @outPorts.out.endGroup()
          groups.pop()
          return if groups.length is 0
        when 'disconnect'
          @outPorts.out.disconnect()
          return

exports.getComponent = -> new SendNext
