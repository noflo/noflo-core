const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = `This component receives data on multiple input ports and 
sends the same data out to the connected output port`;
  c.icon = 'compress';

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forwarded',
  });
  c.outPorts.add('out', {
    datatype: 'all',
  });

  return c.process((input, output) => {
    const data = input.get('in');
    return output.sendDone({ out: data });
  });
};
