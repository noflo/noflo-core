const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.icon = 'expand';
  c.description = `This component receives data on a single input port and 
sends the same data out to all connected output ports`;

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forwarded',
  });

  c.outPorts.add('out', {
    datatype: 'all',
  });

  return c.process((input, output) => {
    const data = input.get('in');
    output.sendDone({ out: data });
  });
};
