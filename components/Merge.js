/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `This component receives data on multiple input ports and \
sends the same data out to the connected output port`;
  c.icon = 'compress';

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
