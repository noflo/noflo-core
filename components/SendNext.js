const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Sends next packet in buffer when receiving a bang';
  c.icon = 'forward';

  c.inPorts.add('data', {
    datatype: 'all',
  });
  c.inPorts.add('in', {
    datatype: 'bang',
  });
  c.outPorts.add('out', {
    datatype: 'all',
  });
  c.outPorts.add('empty', {
    datatype: 'bang',
    required: false,
  });

  c.forwardBrackets = {};
  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    const bang = input.getData('in');

    if (!input.hasData('data')) {
      // No data packets in the buffer, send "empty"
      output.sendDone({ empty: true });
      return;
    }

    let sent = false;
    // Loop until we've either drained the buffer completely, or until
    // we hit the next data packet
    while (input.has('data')) {
      if (sent) {
        // If we already sent data, we look ahead to see if next packet is data and bail out
        const buf = c.inPorts.data.getBuffer(bang.scope);
        if (buf[0].type === 'data') { break; }
      }

      const packet = input.get('data');
      output.send({ out: packet });
      if (packet.type === 'data') { sent = true; }
    }
    // After the loop we can deactivate
    output.done();
  });
};
