const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = "Like 'Repeat', except repeat on next tick";
  c.icon = 'step-forward';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to forward',
  });
  c.outPorts.add('out', {
    datatype: 'all',
  });

  return c.process((input, output) => {
    const data = input.get('in');
    setTimeout(() => output.sendDone({ out: data }), 0);
  });
};
