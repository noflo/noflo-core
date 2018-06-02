/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');
const owl = require('owl-deepcopy');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'deep (i.e. recursively) copy an object';
  c.icon = 'copy';

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be copied'
  }
  );
  c.outPorts.add('out', {
    datatype: 'all',
    description: 'Copy of the original packet'
  }
  );

  return c.process(function(input, output) {
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');

    const copy = owl.deepCopy(data);
    output.sendDone({
      out: copy});
  });
};
