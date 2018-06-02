const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'This component drops every packet it receives with no action';
  c.icon = 'trash-o';

  c.inPorts.add('in', {
    datatypes: 'all',
    description: 'Packet to be dropped',
  });

  return c.process((input, output) => {
    const data = input.get('in');
    data.drop();
    output.done();
  });
};
