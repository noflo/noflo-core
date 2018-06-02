const noflo = require('noflo');
const owl = require('owl-deepcopy');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'deep (i.e. recursively) copy an object';
  c.icon = 'copy';

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be copied',
  });
  c.outPorts.add('out', {
    datatype: 'all',
    description: 'Copy of the original packet',
  });

  return c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const data = input.getData('in');

    const copy = owl.deepCopy(data);
    output.sendDone({ out: copy });
  });
};
