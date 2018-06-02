const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = `This component generates a single packet and sends it to
the output port. Mostly usable for debugging, but can also be useful
for starting up networks.`;
  c.icon = 'share';

  c.inPorts.add('in', {
    datatype: 'bang',
    description: 'Signal to send the data packet',
  });
  c.inPorts.add('data', {
    datatype: 'all',
    description: 'Packet to be sent',
    control: true,
    default: null,
  });
  c.outPorts.add('out', {
    datatype: 'all',
  });

  return c.process((input, output) => {
    if (!input.hasStream('in')) { return; }
    if (input.attached('data').length && !input.hasData('data')) { return; }
    input.getData('in');
    const data = input.getData('data');
    output.send({ out: data });
    output.done();
  });
};
