/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'expand';
  c.description = `This component receives data on a single input port and \
sends the same data out to all connected output ports`;

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forwarded'
  }
  );

  c.outPorts.add('out',
    {datatype: 'all'});

  return c.process(function(input, output) {
    const data = input.get('in');
    return output.sendDone({
      out: data});
  });
};
