/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = "Like 'Repeat', except repeat on next tick";
  c.icon = 'step-forward';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to forward'
  }
  );
  c.outPorts.add('out',
    {datatype: 'all'});

  return c.process(function(input, output) {
    const data = input.get('in');
    return setTimeout(() =>
      output.sendDone({
        out: data})
    
    , 0);
  });
};
